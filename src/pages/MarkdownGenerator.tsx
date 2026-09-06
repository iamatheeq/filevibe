import { useMemo, useState } from "react";
import { blocksToMarkdown, newBlock, type BlockType, type MdBlock } from "../lib/blocks";
import { copyText, downloadText, renderMarkdownSafe } from "../lib/renderMd";
import { toast } from "../lib/toast";
import { cn } from "../lib/utils";

const PALETTE: { type: BlockType; label: string }[] = [
  { type: "heading", label: "Heading" },
  { type: "paragraph", label: "Paragraph" },
  { type: "bold", label: "Bold" },
  { type: "italic", label: "Italic" },
  { type: "link", label: "Link" },
  { type: "image", label: "Image" },
  { type: "code", label: "Inline code" },
  { type: "codeblock", label: "Code block" },
  { type: "quote", label: "Quote" },
  { type: "table", label: "Table" },
  { type: "ul", label: "Bullet list" },
  { type: "ol", label: "Numbered list" },
  { type: "task", label: "Task list" },
  { type: "divider", label: "Divider" },
  { type: "badge", label: "Badge" },
  { type: "custom", label: "Custom MD" },
];

export default function MarkdownGenerator() {
  const [blocks, setBlocks] = useState<MdBlock[]>([]);
  
  const markdown = useMemo(() => blocksToMarkdown(blocks), [blocks]);
  const html = useMemo(() => renderMarkdownSafe(markdown), [markdown]);

  const showToast = (m: string, kind: "success" | "error" | "info" = "success") => {
    toast(kind, m);
  };

  const update = (id: string, patch: Partial<MdBlock>) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  };

  const move = (id: string, dir: -1 | 1) => {
    setBlocks((prev) => {
      const i = prev.findIndex((b) => b.id === id);
      if (i < 0) return prev;
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  return (
    <div className="grid grid-cols-1 gap-4 bg-[var(--color-background)] p-4 text-[var(--color-text)] lg:grid-cols-2 sm:p-6">
      <div>
        <h2 className="mb-1 text-[16px] font-semibold tracking-[-0.02em]">Markdown Generator</h2>
        <p className="mb-3 text-[12px] text-[var(--color-text-muted)]">
          Add blocks, edit content, reorder. Output is clean Markdown — not HTML.
        </p>
        <div className="mb-4 flex flex-wrap gap-1.5">
          {PALETTE.map((p) => (
            <button key={p.type} type="button" className="chip" onClick={() => setBlocks((prev) => [...prev, newBlock(p.type)])}>
              + {p.label}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {blocks.map((b) => (
            <div key={b.id} className="glass rounded-2xl p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">{b.type}</span>
                <div className="flex gap-1">
                  <button type="button" className="btn btn-ghost text-[11px]" onClick={() => move(b.id, -1)} aria-label="Move up">
                    ↑
                  </button>
                  <button type="button" className="btn btn-ghost text-[11px]" onClick={() => move(b.id, 1)} aria-label="Move down">
                    ↓
                  </button>
                  <button type="button" className="btn btn-ghost text-[11px]" onClick={() => setBlocks((prev) => [...prev, { ...b, id: crypto.randomUUID() }])}>
                    Duplicate
                  </button>
                  <button type="button" className="btn btn-ghost text-[11px]" onClick={() => setBlocks((prev) => prev.filter((x) => x.id !== b.id))}>
                    Delete
                  </button>
                </div>
              </div>
              {b.type === "heading" && (
                <div className="flex gap-2">
                  <select className="field !w-24" value={b.level || 2} onChange={(e) => update(b.id, { level: Number(e.target.value) as 1 | 2 | 3 | 4 })}>
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>
                        H{n}
                      </option>
                    ))}
                  </select>
                  <input className="field" value={b.text || ""} onChange={(e) => update(b.id, { text: e.target.value })} />
                </div>
              )}
              {(b.type === "paragraph" || b.type === "bold" || b.type === "italic" || b.type === "code" || b.type === "quote" || b.type === "custom" || b.type === "codeblock") && (
                <textarea className="field min-h-[64px] font-mono text-[12px]" value={b.text || ""} onChange={(e) => update(b.id, { text: e.target.value })} />
              )}
              {b.type === "codeblock" && (
                <input className="field mt-2" placeholder="Language" value={b.lang || ""} onChange={(e) => update(b.id, { lang: e.target.value })} />
              )}
              {(b.type === "link" || b.type === "image") && (
                <div className="grid gap-2 sm:grid-cols-2">
                  <input className="field" placeholder={b.type === "image" ? "Alt" : "Label"} value={b.type === "image" ? b.alt || "" : b.text || ""} onChange={(e) => update(b.id, b.type === "image" ? { alt: e.target.value } : { text: e.target.value })} />
                  <input className="field" placeholder="URL" value={b.href || ""} onChange={(e) => update(b.id, { href: e.target.value })} />
                </div>
              )}
              {(b.type === "ul" || b.type === "ol" || b.type === "task") && (
                <textarea
                  className="field min-h-[80px] font-mono text-[12px]"
                  value={(b.items || []).join("\n")}
                  onChange={(e) => update(b.id, { items: e.target.value.split("\n") })}
                  placeholder="One item per line"
                />
              )}
              {b.type === "table" && (
                <textarea
                  className="field min-h-[100px] font-mono text-[12px]"
                  value={(b.rows || []).map((r) => r.join(" | ")).join("\n")}
                  onChange={(e) =>
                    update(b.id, {
                      rows: e.target.value.split("\n").map((line) => line.split("|").map((c) => c.trim())),
                    })
                  }
                  placeholder="Col A | Col B"
                />
              )}
              {b.type === "badge" && (
                <div className="grid gap-2 sm:grid-cols-3">
                  <input className="field" placeholder="Label" value={b.badgeLabel || ""} onChange={(e) => update(b.id, { badgeLabel: e.target.value })} />
                  <input className="field" placeholder="Color hex" value={b.badgeColor || ""} onChange={(e) => update(b.id, { badgeColor: e.target.value })} />
                  <input className="field" placeholder="Link" value={b.href || ""} onChange={(e) => update(b.id, { href: e.target.value })} />
                </div>
              )}
              {b.type === "divider" && <p className="text-[12px] text-[var(--color-text-muted)]">Horizontal rule</p>}
            </div>
          ))}
        </div>
        <div className="sticky bottom-0 mt-4 flex gap-2 bg-gradient-to-t from-[var(--color-background)] pt-4">
          <button
            type="button"
            className="btn btn-ghost flex-1"
            onClick={async () => {
              const r = await copyText(markdown);
              showToast(r.message);
            }}
          >
            Copy Markdown
          </button>
          <button type="button" className="btn btn-primary flex-1" onClick={() => downloadText("generated.md", markdown)}>
            Download .md
          </button>
        </div>
      </div>
      <div>
        <h3 className="mb-2 text-[13px] font-semibold">Live preview</h3>
        <div className="glass mb-4 min-h-[40vh] rounded-3xl p-5">
          <div className="md-body" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
        <h3 className="mb-2 text-[13px] font-semibold">Generated Markdown</h3>
        <pre className={cn("field max-h-[40vh] overflow-auto whitespace-pre-wrap font-mono text-[12px]")}>{markdown}</pre>
      </div>
    </div>
  );
}
