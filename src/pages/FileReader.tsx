import { useEffect, useMemo, useRef, useState } from "react";
import { capabilitiesFor, type FileCapabilities } from "../lib/file/capabilities";
import { detectFile, formatBytes, type DetectedFile } from "../lib/file/detect";
import { processingDetail, processingLabel, revokeUrl, safeErrorMessage } from "../lib/privacy";
import { renderMarkdownSafe } from "../lib/renderMd";
import { toast } from "../lib/toast";
import { downloadText } from "../lib/renderMd";
import { Button } from "../components/ui/Button";
import { enterFullscreen, exitFullscreen, isFullscreen } from "../lib/fullscreen";
import { cn } from "../lib/utils";

export default function FileReader() {
  const [file, setFile] = useState<File | null>(null);
  const [meta, setMeta] = useState<DetectedFile | null>(null);
  const [caps, setCaps] = useState<FileCapabilities | null>(null);
  const [text, setText] = useState("");
  const [edit, setEdit] = useState(false);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [htmlMode, setHtmlMode] = useState<"source" | "preview">("source");
  const [busy, setBusy] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const [fs, setFs] = useState(false);
  useEffect(() => {
    const onFs = () => setFs(isFullscreen());
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  useEffect(() => {
    return () => revokeUrl(objectUrl);
  }, [objectUrl]);

  const onFile = async (f: File | null) => {
    revokeUrl(objectUrl);
    setObjectUrl(null);
    setText("");
    setEdit(false);
    setFile(f);
    if (!f) {
      setMeta(null);
      setCaps(null);
      return;
    }
    setBusy(true);
    try {
      const d = await detectFile(f);
      const c = capabilitiesFor(d.category, d.extension);
      setMeta(d);
      setCaps(c);
      if (c.viewMode === "image" || c.viewMode === "audio" || c.viewMode === "video" || c.viewMode === "pdf") {
        setObjectUrl(URL.createObjectURL(f));
      } else if (c.canView && ["text", "code", "markdown", "json", "csv", "html", "css"].includes(c.viewMode)) {
        const content = await f.text();
        setText(content);
      }
      toast("success", `Detected ${d.label}`);
    } catch (e) {
      toast("error", safeErrorMessage(e, "Unable to read this file."));
    } finally {
      setBusy(false);
    }
  };

  const mdHtml = useMemo(() => (caps?.viewMode === "markdown" ? renderMarkdownSafe(text) : ""), [caps, text]);

  const csvTable = useMemo(() => {
    if (caps?.viewMode !== "csv" || !text) return null;
    const lines = text.trim().split(/\r?\n/).slice(0, 200);
    return lines.map((line) => line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((c) => c.replace(/^"|"$/g, "")));
  }, [caps, text]);

  const downloadEdited = () => {
    if (!file || !meta) return;
    downloadText(meta.name || "edited.txt", text, file.type || "text/plain;charset=utf-8");
    toast("success", "Download started");
  };

  return (
    <div ref={rootRef} className="mx-auto max-w-5xl p-4 sm:p-6 bg-[var(--color-background)]">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[18px] font-semibold tracking-[-0.02em]">File Reader</h2>
          <p className="text-[13px] text-[var(--color-text-muted)]">
            Accept any file · detect type · view when supported · never execute uploaded code
          </p>
        </div>
        <button
          type="button"
          className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-[11px] font-medium text-[var(--color-text-muted)]"
          onClick={() => setPrivacyOpen((v) => !v)}
        >
          {processingLabel("local")}
        </button>
      </div>
      {privacyOpen && (
        <p className="mb-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[12px] text-[var(--color-text-muted)]">
          {processingDetail("local")}
        </p>
      )}

      <div
        className={cn(
          "mb-4 flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-[var(--radius-xl)] border-2 border-dashed px-4 py-8 text-center transition",
          "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/50",
        )}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void onFile(e.dataTransfer.files?.[0] ?? null);
        }}
        onClick={() => document.getElementById("fv-reader-input")?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && document.getElementById("fv-reader-input")?.click()}
      >
        <p className="text-[14px] font-medium">Drop any file here</p>
        <p className="mt-1 text-[12px] text-[var(--color-text-muted)]">or browse from your device</p>
        <input id="fv-reader-input" type="file" className="hidden" onChange={(e) => void onFile(e.target.files?.[0] ?? null)} />
      </div>

      {busy && <p className="text-[13px] text-[var(--color-text-muted)]">Analyzing…</p>}

      {meta && caps && (
        <div className="space-y-4">
          <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-[13px]">
            <p className="font-semibold text-[var(--color-text)]">{meta.name}</p>
            <p className="mt-1 text-[var(--color-text-muted)]">
              {meta.label} · {formatBytes(meta.size)} · {meta.mime}
              {meta.extension ? ` · .${meta.extension}` : ""}
            </p>
            {meta.signature && (
              <p className="mt-1 font-mono text-[11px] text-[var(--color-text-muted)]">Signature: {meta.signature}</p>
            )}
            {caps.notes && <p className="mt-2 text-[12px] text-[var(--color-warning)]">{caps.notes}</p>}
            <div className="mt-3 flex flex-wrap gap-2">
              {caps.canEdit && (
                <Button size="sm" variant={edit ? "primary" : "secondary"} onClick={() => setEdit((v) => !v)}>
                  {edit ? "Viewing" : "Edit"}
                </Button>
              )}
              {caps.canEdit && edit && (
                <Button size="sm" onClick={downloadEdited}>
                  Download edited
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (!file) return;
                  const a = document.createElement("a");
                  const url = URL.createObjectURL(file);
                  a.href = url;
                  a.download = file.name;
                  a.click();
                  revokeUrl(url);
                }}
              >
                Download original
              </Button>
            </div>
          </div>

          {caps.viewMode === "image" && objectUrl && (
            <div className="overflow-auto rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <img src={objectUrl} alt={meta.name} className="mx-auto max-h-[70vh] max-w-full object-contain" />
            </div>
          )}
          {caps.viewMode === "audio" && objectUrl && (
            <audio controls src={objectUrl} className="w-full" />
          )}
          {caps.viewMode === "video" && objectUrl && (
            <video controls src={objectUrl} className="mx-auto max-h-[70vh] w-full rounded-[var(--radius-lg)]" />
          )}
          {caps.viewMode === "pdf" && objectUrl && (
            <iframe title="PDF" src={objectUrl} className="h-[70vh] w-full rounded-[var(--radius-lg)] border border-[var(--color-border)]" />
          )}
          {caps.viewMode === "html" && (
            <div>
              <div className="mb-2 flex gap-2">
                <Button size="sm" variant={htmlMode === "source" ? "primary" : "ghost"} onClick={() => setHtmlMode("source")}>
                  Source
                </Button>
                <Button size="sm" variant={htmlMode === "preview" ? "primary" : "ghost"} onClick={() => setHtmlMode("preview")}>
                  Safe Preview
                </Button>
              </div>
              {htmlMode === "source" ? (
                edit ? (
                  <textarea className="field min-h-[50vh] font-mono text-[12px]" value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} />
                ) : (
                  <pre className="max-h-[60vh] overflow-auto rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 font-mono text-[12px] whitespace-pre-wrap">{text}</pre>
                )
              ) : (
                <iframe
                  title="HTML preview"
                  sandbox=""
                  srcDoc={text}
                  className="h-[60vh] w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white"
                />
              )}
            </div>
          )}
          {caps.viewMode === "markdown" && (
            <div className="grid gap-3 lg:grid-cols-2">
              {edit ? (
                <textarea className="field min-h-[50vh] font-mono text-[12px]" value={text} onChange={(e) => setText(e.target.value)} />
              ) : (
                <pre className="max-h-[60vh] overflow-auto rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 font-mono text-[12px] whitespace-pre-wrap">{text}</pre>
              )}
              <div className="md-body max-h-[60vh] overflow-auto rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4" dangerouslySetInnerHTML={{ __html: mdHtml }} />
            </div>
          )}
          {caps.viewMode === "csv" && csvTable && (
            <div className="max-h-[60vh] overflow-auto rounded-[var(--radius-lg)] border border-[var(--color-border)]">
              <table className="w-full text-left text-[12px]">
                <tbody>
                  {csvTable.map((row, i) => (
                    <tr key={i} className={i === 0 ? "bg-[var(--color-surface-elevated)] font-semibold" : "border-t border-[var(--color-border)]"}>
                      {row.map((cell, j) => (
                        <td key={j} className="px-2 py-1.5 whitespace-nowrap">
                          {edit && i > 0 ? (
                            <input
                              className="field !py-1"
                              value={cell}
                              onChange={(e) => {
                                const lines = text.split(/\r?\n/);
                                const cols = lines[i]?.split(",") ?? [];
                                cols[j] = e.target.value;
                                lines[i] = cols.join(",");
                                setText(lines.join("\n"));
                              }}
                            />
                          ) : (
                            cell
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {(caps.viewMode === "text" || caps.viewMode === "code" || caps.viewMode === "json") && (
            edit ? (
              <textarea className="field min-h-[50vh] font-mono text-[12px]" value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} />
            ) : (
              <pre className="max-h-[60vh] overflow-auto rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 font-mono text-[12px] whitespace-pre-wrap">{text}</pre>
            )
          )}
          {caps.viewMode === "none" && (
            <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-[13px] text-[var(--color-text-muted)]">
              Preview is not currently supported for this format. You can download the original file.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
