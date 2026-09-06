import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../components/ui/Button";
import { enterFullscreen, exitFullscreen, isFullscreen } from "../lib/fullscreen";
import {
  downloadPdfBytes,
  extractTextHits,
  listFormFields,
  replaceTextHits,
  setFormFieldValues,
  type FormFieldInfo,
  type TextHit,
} from "../lib/pdf/edit";
import { formatBytes } from "../lib/file/detect";
import { processingLabel, revokeUrl, safeErrorMessage } from "../lib/privacy";
import { toast } from "../lib/toast";

export default function PdfEditor() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [password, setPassword] = useState("");
  const [needPassword, setNeedPassword] = useState(false);
  const [hits, setHits] = useState<TextHit[]>([]);
  const [query, setQuery] = useState("");
  const [replacement, setReplacement] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [fields, setFields] = useState<FormFieldInfo[]>([]);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [bytes, setBytes] = useState<Uint8Array | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const [fs, setFs] = useState(false);

  useEffect(() => () => revokeUrl(url), [url]);
  useEffect(() => {
    const onFs = () => setFs(isFullscreen());
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return hits.slice(0, 80);
    return hits.filter((h) => h.str.toLowerCase().includes(q)).slice(0, 80);
  }, [hits, query]);

  const load = async (f: File, pwd?: string) => {
    setBusy(true);
    setNeedPassword(false);
    setUnlocked(false);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const raw = new Uint8Array(await f.arrayBuffer());
      try {
        await PDFDocument.load(raw, { ignoreEncryption: false, ...(pwd ? { password: pwd } : {}) } as Parameters<typeof PDFDocument.load>[1]);
      } catch {
        setNeedPassword(true);
        setFile(f);
        toast("warning", "This PDF requires a password.");
        return;
      }
      setFile(f);
      setBytes(raw);
      setUnlocked(true);
      revokeUrl(url);
      setUrl(URL.createObjectURL(f));
      try {
        setHits(await extractTextHits(f));
      } catch {
        setHits([]);
      }
      try {
        const ff = await listFormFields(raw, pwd);
        setFields(ff);
        const map: Record<string, string> = {};
        ff.forEach((x) => {
          map[x.name] = x.value;
        });
        setFieldValues(map);
      } catch {
        setFields([]);
      }
      toast("success", "PDF loaded. Edit text/forms, then export.");
    } catch (e) {
      toast("error", safeErrorMessage(e, "Unable to open PDF."));
    } finally {
      setBusy(false);
    }
  };

  const exportReplacements = async () => {
    if (!bytes || selected.size === 0 || !replacement) {
      toast("warning", "Select text items and enter a replacement.");
      return;
    }
    setBusy(true);
    try {
      const chosenHits = [...selected].map((i) => hits[i]).filter(Boolean);
      const out = await replaceTextHits(bytes, chosenHits, replacement, password || undefined);
      downloadPdfBytes(out, (file?.name || "document").replace(/\.pdf$/i, "") + "-edited.pdf");
      revokeUrl(url);
      setUrl(URL.createObjectURL(new Blob([out], { type: "application/pdf" })));
      setBytes(out);
      toast("success", "Exported PDF with text replacements.");
    } catch (e) {
      toast("error", safeErrorMessage(e, "Export failed."));
    } finally {
      setBusy(false);
    }
  };

  const exportForms = async () => {
    if (!bytes || fields.length === 0) return;
    setBusy(true);
    try {
      const out = await setFormFieldValues(bytes, fieldValues, password || undefined);
      downloadPdfBytes(out, (file?.name || "document").replace(/\.pdf$/i, "") + "-forms.pdf");
      revokeUrl(url);
      setUrl(URL.createObjectURL(new Blob([out], { type: "application/pdf" })));
      setBytes(out);
      toast("success", "Exported PDF with form values.");
    } catch (e) {
      toast("error", safeErrorMessage(e, "Form export failed."));
    } finally {
      setBusy(false);
    }
  };

  /** After successful password auth, re-save without encryption. */
  const exportUnencrypted = async () => {
    if (!bytes || !unlocked) {
      toast("warning", "Open and unlock the PDF first.");
      return;
    }
    setBusy(true);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const pdf = await PDFDocument.load(bytes, {
        ignoreEncryption: false,
        ...(password ? { password } : {}),
      } as Parameters<typeof PDFDocument.load>[1]);
      const out = await pdf.save();
      downloadPdfBytes(out, (file?.name || "document").replace(/\.pdf$/i, "") + "-unencrypted.pdf");
      revokeUrl(url);
      setUrl(URL.createObjectURL(new Blob([out], { type: "application/pdf" })));
      setBytes(out);
      setNeedPassword(false);
      toast("success", "Exported unencrypted PDF (only after correct password).");
    } catch (e) {
      toast("error", safeErrorMessage(e, "Unable to export unencrypted PDF."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div ref={rootRef} className="flex h-full min-h-[70vh] flex-col bg-[var(--color-background)] text-[var(--color-text)]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
        <div>
          <h2 className="text-[16px] font-semibold">PDF Editor</h2>
          <p className="text-[12px] text-[var(--color-text-muted)]">
            Text replace · forms · unlock & export unencrypted · {processingLabel("local")}
          </p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => (isFullscreen() ? void exitFullscreen() : rootRef.current && void enterFullscreen(rootRef.current))}
        >
          {fs ? "Exit Fullscreen" : "Fullscreen"}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2">
        <Button size="sm" variant="secondary" onClick={() => document.getElementById("fv-pdf-input")?.click()}>
          Open PDF
        </Button>
        <input
          id="fv-pdf-input"
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && void load(e.target.files[0])}
        />
        <Button size="sm" variant="ghost" disabled={!url} onClick={() => setZoom((z) => Math.max(50, z - 10))}>
          Zoom −
        </Button>
        <span className="text-[12px] text-[var(--color-text-muted)]">{zoom}%</span>
        <Button size="sm" variant="ghost" disabled={!url} onClick={() => setZoom((z) => Math.min(200, z + 10))}>
          Zoom +
        </Button>
        <Button size="sm" variant="secondary" disabled={!unlocked} loading={busy} onClick={() => void exportUnencrypted()}>
          Export Unencrypted
        </Button>
      </div>

      {needPassword && (
        <div className="border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-3">
          <p className="text-[13px] font-medium">Password-protected PDF</p>
          <p className="text-[12px] text-[var(--color-text-muted)]">
            Enter the correct password. FileVibe does not store, log, or bypass passwords.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <input
              className="field max-w-xs"
              type="password"
              autoComplete="off"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="PDF password"
              onKeyDown={(e) => e.key === "Enter" && file && void load(file, password)}
            />
            <Button size="sm" loading={busy} onClick={() => file && void load(file, password)}>
              Unlock & Open
            </Button>
          </div>
        </div>
      )}

      {!url && !needPassword ? (
        <div
          className="m-4 flex min-h-[45vh] flex-1 cursor-pointer flex-col items-center justify-center rounded-[var(--radius-xl)] border-2 border-dashed border-[var(--color-border)] bg-[var(--color-surface)]"
          onClick={() => document.getElementById("fv-pdf-input")?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f) void load(f);
          }}
        >
          <p className="text-[14px] font-medium">Open a PDF to edit content</p>
          <p className="mt-1 max-w-lg text-center text-[12px] text-[var(--color-text-muted)]">
            Select extracted text → replace in exported PDF. Unlock protected files with the correct password, then Export Unencrypted.
          </p>
        </div>
      ) : url ? (
        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-h-0 overflow-auto p-2">
            {file && (
              <p className="mb-1 px-2 text-[12px] text-[var(--color-text-muted)]">
                {file.name} · {formatBytes(file.size)}
              </p>
            )}
            <div style={{ width: `${zoom}%`, maxWidth: "100%" }} className="mx-auto">
              <iframe title="PDF" src={url} className="h-[70vh] w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white" />
            </div>
          </div>
          <aside className="space-y-4 overflow-y-auto border-t border-[var(--color-border)] bg-[var(--color-surface)] p-3 lg:border-l lg:border-t-0">
            <div>
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Replace text</h3>
              <input className="field mt-2" placeholder="Filter text…" value={query} onChange={(e) => setQuery(e.target.value)} />
              <input className="field mt-2" placeholder="Replacement text" value={replacement} onChange={(e) => setReplacement(e.target.value)} />
              <div className="mt-2 max-h-48 space-y-1 overflow-y-auto">
                {filtered.length === 0 && (
                  <p className="text-[12px] text-[var(--color-text-muted)]">No text items (scanned PDF or empty).</p>
                )}
                {filtered.map((h) => {
                  const idx = hits.indexOf(h);
                  const on = selected.has(idx);
                  return (
                    <button
                      key={`${h.pageIndex}-${idx}-${h.str.slice(0, 12)}`}
                      type="button"
                      className={`block w-full truncate rounded-md border px-2 py-1 text-left text-[12px] ${on ? "border-[var(--color-primary)] bg-[var(--color-field)]" : "border-[var(--color-border)]"}`}
                      onClick={() =>
                        setSelected((prev) => {
                          const n = new Set(prev);
                          if (n.has(idx)) n.delete(idx);
                          else n.add(idx);
                          return n;
                        })
                      }
                    >
                      p{h.pageIndex + 1}: {h.str}
                    </button>
                  );
                })}
              </div>
              <Button className="mt-2 w-full" size="sm" loading={busy} onClick={() => void exportReplacements()}>
                Export with replacements
              </Button>
            </div>
            {fields.length > 0 && (
              <div>
                <h3 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Form fields</h3>
                <div className="mt-2 max-h-40 space-y-2 overflow-y-auto">
                  {fields.map((f) => (
                    <label key={f.name} className="block text-[12px]">
                      <span className="text-[var(--color-text-muted)]">{f.name}</span>
                      <input
                        className="field mt-0.5"
                        value={fieldValues[f.name] ?? ""}
                        onChange={(e) => setFieldValues((v) => ({ ...v, [f.name]: e.target.value }))}
                      />
                    </label>
                  ))}
                </div>
                <Button className="mt-2 w-full" size="sm" variant="secondary" loading={busy} onClick={() => void exportForms()}>
                  Export form values
                </Button>
              </div>
            )}
          </aside>
        </div>
      ) : null}
    </div>
  );
}
