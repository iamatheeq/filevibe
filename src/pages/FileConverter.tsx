import { useCallback, useState } from "react";
import { convertFile } from "../lib/convert";
import { detectFile, formatBytes, type DetectedFile } from "../lib/file/detect";
import { categoryHint, targetsForExtension } from "../lib/file/registry";
import { processingLabel, safeErrorMessage } from "../lib/privacy";
import { renderMarkdownSafe } from "../lib/renderMd";
import { toast } from "../lib/toast";
import { Button } from "../components/ui/Button";
import { Dropdown } from "../components/ui/Dropdown";
import { marked } from "marked";
import { cn } from "../lib/utils";

type Phase = "idle" | "analyzing" | "converting" | "done" | "error";

export default function FileConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [meta, setMeta] = useState<DetectedFile | null>(null);
  const [target, setTarget] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<{ content: string; filename: string; mime: string; binary?: Uint8Array } | null>(null);
  const [error, setError] = useState("");
  const [drag, setDrag] = useState(false);

  const paths = meta ? targetsForExtension(meta.extension) : [];

  const onPick = async (f: File | null) => {
    setFile(f);
    setResult(null);
    setError("");
    setTarget("");
    setPhase("idle");
    setMeta(null);
    if (!f) return;
    setPhase("analyzing");
    try {
      const d = await detectFile(f);
      setMeta(d);
      const opts = targetsForExtension(d.extension);
      if (opts[0]) setTarget(opts[0].to);
      setPhase("idle");
    } catch (e) {
      setError(safeErrorMessage(e, "Unable to analyze file."));
      setPhase("error");
    }
  };

  const run = useCallback(async () => {
    if (!file || !target) return;
    setPhase("converting");
    setError("");
    try {
      const mdToHtml = (md: string) => marked.parse(md, { async: false }) as string;
      // Map registry target to convert.ts formats
      const r = await convertFile(file, target, mdToHtml);
      if (!r.ok) {
        setError(r.error || "Conversion failed.");
        setPhase("error");
        toast("error", r.error || "Conversion failed.");
        return;
      }
      setResult({ content: r.content, filename: r.filename, mime: r.mime, binary: r.binary });
      setPhase("done");
      toast("success", "Converted locally.");
    } catch (e) {
      setError(safeErrorMessage(e, "Conversion failed."));
      setPhase("error");
      toast("error", safeErrorMessage(e, "Conversion failed."));
    }
  }, [file, target]);

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-[18px] font-semibold">File Converter</h2>
          <p className="text-[13px] text-[var(--color-text-muted)]">Any file → detect → show real conversion options only</p>
        </div>
        <span className="rounded-full border border-[var(--color-border)] px-3 py-1 text-[11px] text-[var(--color-text-muted)]">
          {processingLabel("local")}
        </span>
      </div>

      <div
        className={cn(
          "mb-4 flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-[var(--radius-xl)] border-2 border-dashed px-4 py-8 text-center",
          drag ? "border-[var(--color-primary)] bg-[var(--color-field)]" : "border-[var(--color-border)] bg-[var(--color-surface)]",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          void onPick(e.dataTransfer.files?.[0] ?? null);
        }}
        onClick={() => document.getElementById("fv-conv-input")?.click()}
      >
        <p className="text-[14px] font-medium">Drop any file here</p>
        <p className="mt-1 text-[12px] text-[var(--color-text-muted)]">or browse from your device</p>
        <input id="fv-conv-input" type="file" className="hidden" onChange={(e) => void onPick(e.target.files?.[0] ?? null)} />
      </div>

      {meta && (
        <div className="mb-4 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-[13px]">
          <p className="font-semibold">{meta.name}</p>
          <p className="text-[var(--color-text-muted)]">
            {meta.label} · {formatBytes(meta.size)} · {meta.mime}
          </p>
          <p className="mt-2 text-[12px] text-[var(--color-text-muted)]">{categoryHint(meta.category)}</p>
          {paths.length === 0 ? (
            <p className="mt-3 text-[var(--color-warning)]">No compatible client-side converter for this format.</p>
          ) : (
            <>
              <label className="mb-1.5 mt-3 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                Convert to
              </label>
              <Dropdown
                value={target}
                onChange={setTarget}
                options={paths.map((p) => ({ value: p.to, label: p.label }))}
              />
              <Button className="mt-3" loading={phase === "converting"} disabled={!target} onClick={() => void run()}>
                Convert
              </Button>
            </>
          )}
        </div>
      )}

      {phase === "error" && error && (
        <div className="mb-3 rounded-[var(--radius-lg)] border border-[var(--color-error)]/40 bg-[var(--color-error)]/10 px-3 py-2 text-[13px]">{error}</div>
      )}

      {phase === "done" && result && (
        <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="text-[13px]">Output: {result.filename}</p>
          {!result.content.startsWith("(binary") && (
            <>
              <Button
                size="sm"
                className="mt-2"
                onClick={() => {
                  const blob = result.binary
                    ? new Blob([result.binary], { type: result.mime })
                    : new Blob([result.content], { type: result.mime });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = result.filename;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Download
              </Button>
              <pre className="mt-3 max-h-[40vh] overflow-auto whitespace-pre-wrap font-mono text-[12px]">
                {result.content.slice(0, 12000)}
                {result.content.length > 12000 ? "\n…" : ""}
              </pre>
            </>
          )}
          {result.content.startsWith("(binary") && <p className="mt-2 text-[13px] text-[var(--color-text-muted)]">{result.content} — download triggered.</p>}
        </div>
      )}
    </div>
  );
}
