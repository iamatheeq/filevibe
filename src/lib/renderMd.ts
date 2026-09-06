import { marked } from "marked";
import DOMPurify from "dompurify";

marked.setOptions({ gfm: true, breaks: false });

/** Safe Markdown → HTML for preview panes. */
export function renderMarkdownSafe(source: string): string {
  if (!source.trim()) return "";
  const html = marked.parse(source, { async: false }) as string;
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ["target", "rel", "align", "width", "height"],
  });
}

export function downloadText(filename: string, content: string, mime = "text/markdown;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function copyText(text: string): Promise<{ ok: boolean; message: string }> {
  try {
    await navigator.clipboard.writeText(text);
    return { ok: true, message: "Copied to clipboard." };
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      return { ok: true, message: "Copied to clipboard." };
    } catch {
      return { ok: false, message: "Unable to access clipboard." };
    }
  }
}
