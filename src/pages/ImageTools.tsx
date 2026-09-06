import { useEffect, useState } from "react";
import { detectFile, formatBytes } from "../lib/file/detect";
import { processingLabel, revokeUrl, safeErrorMessage } from "../lib/privacy";
import { toast } from "../lib/toast";
import { Button } from "../components/ui/Button";
import { Dropdown } from "../components/ui/Dropdown";
import { canUseFeature, getLimits } from "../lib/entitlements";

type Target = "original" | "10mb" | "5mb" | "2mb" | "1mb" | "500kb" | "250kb" | "100kb" | "custom";

const TARGET_BYTES: Record<Exclude<Target, "original" | "custom">, number> = {
  "10mb": 10 * 1024 * 1024,
  "5mb": 5 * 1024 * 1024,
  "2mb": 2 * 1024 * 1024,
  "1mb": 1024 * 1024,
  "500kb": 500 * 1024,
  "250kb": 250 * 1024,
  "100kb": 100 * 1024,
};

async function loadImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Unable to decode image."));
      img.src = url;
    });
    return img;
  } finally {
    revokeUrl(url);
  }
}

async function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Encode failed."))), type, quality);
  });
}

/** Binary-search quality to approach target size (JPEG/WebP). */
async function compressToTarget(
  canvas: HTMLCanvasElement,
  mime: string,
  targetBytes: number,
): Promise<{ blob: Blob; quality: number }> {
  let lo = 0.05;
  let hi = 0.95;
  let best: Blob | null = null;
  let bestQ = 0.8;
  for (let i = 0; i < 10; i++) {
    const q = (lo + hi) / 2;
    const blob = await canvasToBlob(canvas, mime, q);
    best = blob;
    bestQ = q;
    if (blob.size > targetBytes) hi = q;
    else lo = q;
  }
  return { blob: best!, quality: bestQ };
}

export default function ImageTools() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const [outInfo, setOutInfo] = useState<{ size: number; w: number; h: number; type: string } | null>(null);
  const [target, setTarget] = useState<Target>("1mb");
  const [customKb, setCustomKb] = useState("800");
  const [format, setFormat] = useState("image/jpeg");
  const [maxW, setMaxW] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => () => { revokeUrl(preview); revokeUrl(outUrl); }, [preview, outUrl]);

  const onFile = async (f: File | null) => {
    revokeUrl(preview);
    revokeUrl(outUrl);
    setOutUrl(null);
    setOutInfo(null);
    setFile(f);
    if (!f) {
      setPreview(null);
      return;
    }
    const d = await detectFile(f);
    if (d.category !== "image") {
      toast("error", "Please select an image file.");
      setFile(null);
      return;
    }
    setPreview(URL.createObjectURL(f));
  };

  const process = async () => {
    if (!file) return;
    if (!canUseFeature("image.compressor")) {
      toast("warning", "Image compression is not available on this plan.");
      return;
    }
    setBusy(true);
    try {
      const img = await loadImage(file);
      const limits = getLimits();
      if (img.width * img.height > limits.maxImagePixels) {
        toast("error", "Image dimensions are too large for safe browser processing.");
        return;
      }
      let w = img.width;
      let h = img.height;
      const mw = Number(maxW);
      if (mw > 0 && w > mw) {
        h = Math.round((h * mw) / w);
        w = mw;
      }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable.");
      ctx.drawImage(img, 0, 0, w, h);

      let blob: Blob;
      if (target === "original") {
        blob = await canvasToBlob(canvas, format, 0.92);
      } else {
        const bytes =
          target === "custom" ? Math.max(50, Number(customKb) || 800) * 1024 : TARGET_BYTES[target];
        const r = await compressToTarget(canvas, format === "image/png" ? "image/jpeg" : format, bytes);
        blob = r.blob;
      }
      revokeUrl(outUrl);
      const url = URL.createObjectURL(blob);
      setOutUrl(url);
      setOutInfo({ size: blob.size, w, h, type: blob.type });
      toast("success", "Image processed locally.");
    } catch (e) {
      toast("error", safeErrorMessage(e, "Image processing failed."));
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    if (!outUrl || !file) return;
    const a = document.createElement("a");
    a.href = outUrl;
    a.download = file.name.replace(/\.[^.]+$/, "") + "-filevibe.jpg";
    a.click();
  };

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-[18px] font-semibold">Image Tools</h2>
          <p className="text-[13px] text-[var(--color-text-muted)]">Resize & compress in your browser · no upload</p>
        </div>
        <span className="rounded-full border border-[var(--color-border)] px-3 py-1 text-[11px] text-[var(--color-text-muted)]">
          {processingLabel("local")}
        </span>
      </div>

      <div
        className="mb-4 flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-[var(--radius-xl)] border-2 border-dashed border-[var(--color-border)] bg-[var(--color-surface)]"
        onClick={() => document.getElementById("fv-img-input")?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void onFile(e.dataTransfer.files?.[0] ?? null);
        }}
      >
        <p className="text-[14px] font-medium">Drop image</p>
        <input id="fv-img-input" type="file" accept="image/*" className="hidden" onChange={(e) => void onFile(e.target.files?.[0] ?? null)} />
      </div>

      {file && (
        <div className="mb-4 space-y-3 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-[13px]">
          <p>
            {file.name} · {formatBytes(file.size)}
          </p>
          {preview && <img src={preview} alt="" className="max-h-48 rounded-lg object-contain" />}
          <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Target size</label>
          <Dropdown
            value={target}
            onChange={(v) => setTarget(v as Target)}
            options={[
              { value: "original", label: "High quality (no size target)" },
              { value: "10mb", label: "≤ 10 MB" },
              { value: "5mb", label: "≤ 5 MB" },
              { value: "2mb", label: "≤ 2 MB" },
              { value: "1mb", label: "≤ 1 MB" },
              { value: "500kb", label: "≤ 500 KB" },
              { value: "250kb", label: "≤ 250 KB" },
              { value: "100kb", label: "≤ 100 KB" },
              { value: "custom", label: "Custom KB" },
            ]}
          />
          {target === "custom" && (
            <input className="field" value={customKb} onChange={(e) => setCustomKb(e.target.value)} placeholder="Target KB" />
          )}
          <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Output format</label>
          <Dropdown
            value={format}
            onChange={setFormat}
            options={[
              { value: "image/jpeg", label: "JPEG" },
              { value: "image/webp", label: "WebP" },
              { value: "image/png", label: "PNG" },
            ]}
          />
          <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Max width (optional)</label>
          <input className="field" value={maxW} onChange={(e) => setMaxW(e.target.value)} placeholder="e.g. 1920" />
          <Button loading={busy} onClick={() => void process()}>
            Process locally
          </Button>
        </div>
      )}

      {outInfo && outUrl && (
        <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="text-[13px]">
            Output: {formatBytes(outInfo.size)} · {outInfo.w}×{outInfo.h} · {outInfo.type}
            {file && ` · ${Math.max(0, Math.round((1 - outInfo.size / file.size) * 100))}% smaller`}
          </p>
          <img src={outUrl} alt="Result" className="mt-3 max-h-64 rounded-lg object-contain" />
          <Button className="mt-3" size="sm" onClick={download}>
            Download
          </Button>
        </div>
      )}
    </div>
  );
}
