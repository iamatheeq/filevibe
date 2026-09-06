import type { DragEvent as ReactDragEvent } from "react";
import { useMemo, useRef, useState } from "react";
import { copyText, downloadText, renderMarkdownSafe } from "../lib/renderMd";
import { toast } from "../lib/toast";
import { cn } from "../lib/utils";

const SAMPLE = `# Markdown Previewer

Type or paste Markdown on the left. Preview updates live.

## Features

- **Bold**, *italic*, ~~strike~~
- Lists, tables, code
- Safe HTML (scripts stripped)

\`\`\`ts
const hello = "MD Craft";
\`\`\`

| Col A | Col B |
| --- | --- |
| 1 | 2 |

> Elevating Markdown
`;

export default function MarkdownPreviewer() {
  const [source, setSource] = useState(SAMPLE);
    const [view, setView] = useState<"split" | "edit" | "preview">("split");
  const fileRef = useRef<HTMLInputElement>(null);

  const html = useMemo(() => renderMarkdownSafe(source), [source]);

  const showToast = (m: string, kind: "success" | "error" | "info" = "success") => {
    toast(kind, m);
  };

  const onFile = async (file: File | null) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast("File is too large (max 2 MB).");
      return;
    }
    const text = await file.text();
    setSource(text);
    showToast(`Loaded ${file.name}`);
  };

  const onDrop = (e: ReactDragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = e.dataTransfer?.files?.[0];
    if (f) void onFile(f);
  };

  return (
    <div className="p-4 sm:p-6" onDragOver={(e) => e.preventDefault()} onDrop={onDrop}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-[16px] font-semibold tracking-[-0.02em]">Markdown Previewer</h2>
          <p className="text-[12px] text-[var(--color-text-muted)]">Paste, type, or drop a .md file. Preview is sanitized.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex rounded-full glass-elevated p-0.5 text-[12px]">
            {(["split", "edit", "preview"] as const).map((v) => (
              <button
                key={v}
                type="button"
                className={cn("rounded-full px-3 py-1 capitalize", view === v && "bg-[var(--color-primary-hover)] text-white")}
                onClick={() => setView(v)}
              >
                {v}
              </button>
            ))}
          </div>
          <input ref={fileRef} type="file" accept=".md,.markdown,.txt,text/markdown,text/plain" className="hidden" onChange={(e) => void onFile(e.target.files?.[0] ?? null)} />
          <button type="button" className="btn btn-ghost text-[12px]" onClick={() => fileRef.current?.click()}>
            Upload .md
          </button>
          <button type="button" className="btn btn-ghost text-[12px]" onClick={() => setSource("")}>
            Clear
          </button>
          <button
            type="button"
            className="btn btn-ghost text-[12px]"
            onClick={async () => {
              const r = await copyText(source);
              showToast(r.message);
            }}
          >
            Copy MD
          </button>
          <button type="button" className="btn btn-primary text-[12px]" onClick={() => downloadText("document.md", source)}>
            Download .md
          </button>
          <button
            type="button"
            className="btn btn-ghost text-[12px]"
            onClick={() => downloadText("document.html", `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body>${html}</body></html>`, "text/html;charset=utf-8")}
          >
            Download HTML
          </button>
        </div>
      </div>

      <div
        className={cn(
          "grid gap-4",
          view === "split" ? "lg:grid-cols-2" : "grid-cols-1",
        )}
      >
        {(view === "split" || view === "edit") && (
          <textarea
            className="field min-h-[60vh] resize-y font-mono text-[13px] leading-relaxed"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            spellCheck={false}
            aria-label="Markdown source"
          />
        )}
        {(view === "split" || view === "preview") && (
          <div className="glass min-h-[60vh] rounded-3xl p-5 sm:p-8">
            {source.trim() ? (
              <div className="md-body" dangerouslySetInnerHTML={{ __html: html }} />
            ) : (
              <p className="text-[13px] text-[var(--color-text-muted)]">Nothing to preview.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
