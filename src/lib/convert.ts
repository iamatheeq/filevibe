/** Client-side conversion engine — real parsers only, clear failures. */

export type ConvertResult = {
  ok: boolean;
  content: string;
  mime: string;
  filename: string;
  binary?: Uint8Array;
  error?: string;
};

const MAX_BYTES = 25 * 1024 * 1024;

function baseName(name: string) {
  return name.replace(/\.[^.]+$/, "") || "converted";
}

function extOf(name: string) {
  return (name.includes(".") ? name.split(".").pop()! : "").toLowerCase();
}

function htmlToText(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return (doc.body.textContent || "").replace(/\n{3,}/g, "\n\n").trim();
}

function htmlToMarkdownRough(html: string): string {
  let s = html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "");
  s = s.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "# $1\n\n");
  s = s.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "## $1\n\n");
  s = s.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "### $1\n\n");
  s = s.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, "**$1**");
  s = s.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, "**$1**");
  s = s.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, "*$1*");
  s = s.replace(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)");
  s = s.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "- $1\n");
  s = s.replace(/<br\s*\/?>/gi, "\n");
  s = s.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "$1\n\n");
  s = s.replace(/<[^>]+>/g, "");
  return s.replace(/\n{3,}/g, "\n\n").trim();
}

function parseCsv(text: string, delimiter = ","): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cur += '"';
          i++;
        } else inQ = false;
      } else cur += c;
    } else if (c === '"') inQ = true;
    else if (c === delimiter) {
      row.push(cur);
      cur = "";
    } else if (c === "\n") {
      row.push(cur);
      rows.push(row);
      row = [];
      cur = "";
    } else if (c === "\r") {
      /* skip */
    } else cur += c;
  }
  row.push(cur);
  if (row.some((x) => x.length)) rows.push(row);
  return rows;
}

function rowsToCsv(rows: string[][], delimiter = ","): string {
  return rows
    .map((r) =>
      r
        .map((cell) => {
          const s = String(cell ?? "");
          if (/[",\n\t]/.test(s) || delimiter === "\t") {
            if (delimiter === "\t") return s.replace(/\t/g, " ");
            return `"${s.replace(/"/g, '""')}"`;
          }
          return s;
        })
        .join(delimiter),
    )
    .join("\n");
}

function rowsToMarkdown(rows: string[][]): string {
  if (!rows.length) return "";
  const header = rows[0];
  const body = rows.slice(1);
  const sep = header.map(() => "---");
  const line = (r: string[]) => `| ${r.map((c) => String(c).replace(/\|/g, "\\|")).join(" | ")} |`;
  return [line(header), line(sep), ...body.map(line)].join("\n");
}

function rowsToHtml(rows: string[][]): string {
  if (!rows.length) return "<table></table>";
  const [header, ...body] = rows;
  const th = header.map((c) => `<th>${escapeHtml(String(c))}</th>`).join("");
  const tr = body
    .map((r) => `<tr>${r.map((c) => `<td>${escapeHtml(String(c))}</td>`).join("")}</tr>`)
    .join("");
  return `<table><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table>`;
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function sheetRows(file: File): Promise<string[][]> {
  const XLSX = await import("xlsx");
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array", cellDates: true });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  if (!sheet) return [];
  return XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, defval: "" }) as string[][];
}

async function pdfPagesText(file: File): Promise<string[]> {
  const pdfjs = await import("pdfjs-dist");
  try {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url,
    ).toString();
  } catch {
    /* optional */
  }
  const data = new Uint8Array(await file.arrayBuffer());
  const doc = await pdfjs.getDocument({ data }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((it) => ("str" in it ? it.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    pages.push(text);
  }
  return pages;
}

export async function convertFile(file: File, target: string, mdToHtml?: (md: string) => string): Promise<ConvertResult> {
  if (file.size > MAX_BYTES) {
    return { ok: false, content: "", mime: "text/plain", filename: "error.txt", error: "File exceeds 25 MB browser processing limit." };
  }
  const from = extOf(file.name);
  const name = baseName(file.name);
  const t = target.toLowerCase();

  try {
    // Spreadsheet family
    if (["xlsx", "xls", "xlsm", "xlsb"].includes(from) || (["csv", "tsv"].includes(from) && ["xlsx", "json", "html", "md", "tsv", "csv"].includes(t))) {
      let rows: string[][];
      if (["xlsx", "xls", "xlsm", "xlsb"].includes(from)) {
        rows = await sheetRows(file);
      } else {
        const text = await file.text();
        rows = parseCsv(text, from === "tsv" ? "\t" : ",");
      }
      if (t === "csv") {
        const content = rowsToCsv(rows, ",");
        return { ok: true, content, mime: "text/csv;charset=utf-8", filename: `${name}.csv` };
      }
      if (t === "tsv") {
        const content = rowsToCsv(rows, "\t");
        return { ok: true, content, mime: "text/tab-separated-values;charset=utf-8", filename: `${name}.tsv` };
      }
      if (t === "json") {
        const [header, ...body] = rows;
        const objs = body.map((r) => Object.fromEntries(header.map((h, i) => [String(h), r[i] ?? ""])));
        const content = JSON.stringify(objs, null, 2);
        return { ok: true, content, mime: "application/json", filename: `${name}.json` };
      }
      if (t === "html") {
        return { ok: true, content: rowsToHtml(rows), mime: "text/html;charset=utf-8", filename: `${name}.html` };
      }
      if (t === "md") {
        return { ok: true, content: rowsToMarkdown(rows), mime: "text/markdown;charset=utf-8", filename: `${name}.md` };
      }
      if (t === "xlsx") {
        const XLSX = await import("xlsx");
        const ws = XLSX.utils.aoa_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        const out = XLSX.write(wb, { type: "array", bookType: "xlsx" }) as Uint8Array;
        return {
          ok: true,
          content: `(binary ${out.byteLength} bytes)`,
          mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          filename: `${name}.xlsx`,
          binary: out,
        };
      }
    }

    // DOCX via mammoth
    if (from === "docx") {
      const mammoth = await import("mammoth");
      const buf = await file.arrayBuffer();
      if (t === "html" || t === "md" || t === "txt") {
        const { value: html } = await mammoth.convertToHtml({ arrayBuffer: buf });
        if (t === "html") return { ok: true, content: html, mime: "text/html;charset=utf-8", filename: `${name}.html` };
        if (t === "md") return { ok: true, content: htmlToMarkdownRough(html), mime: "text/markdown;charset=utf-8", filename: `${name}.md` };
        return { ok: true, content: htmlToText(html), mime: "text/plain;charset=utf-8", filename: `${name}.txt` };
      }
    }

    // PDF text extraction
    if (from === "pdf") {
      const pages = await pdfPagesText(file);
      const joined = pages.map((p, i) => `--- Page ${i + 1} ---\n${p}`).join("\n\n");
      if (!joined.replace(/--- Page \d+ ---/g, "").trim()) {
        return {
          ok: false,
          content: "",
          mime: "text/plain",
          filename: "error.txt",
          error: "No text layer found (scanned/image PDF). OCR is not enabled in this build.",
        };
      }
      if (t === "txt") return { ok: true, content: joined, mime: "text/plain;charset=utf-8", filename: `${name}.txt` };
      if (t === "md") return { ok: true, content: pages.map((p, i) => `## Page ${i + 1}\n\n${p}`).join("\n\n"), mime: "text/markdown;charset=utf-8", filename: `${name}.md` };
      if (t === "html") {
        const body = pages.map((p, i) => `<h2>Page ${i + 1}</h2><p>${escapeHtml(p)}</p>`).join("\n");
        return { ok: true, content: `<!DOCTYPE html><html><body>${body}</body></html>`, mime: "text/html;charset=utf-8", filename: `${name}.html` };
      }
      if (t === "json") {
        return {
          ok: true,
          content: JSON.stringify({ pages: pages.map((text, i) => ({ page: i + 1, text })) }, null, 2),
          mime: "application/json",
          filename: `${name}.json`,
        };
      }
    }

    // Text / structured
    const text = await file.text();

    if (from === "json" || t === "json") {
      if (from === "json" && (t === "yaml" || t === "yml")) {
        const yaml = await import("js-yaml");
        const data = JSON.parse(text);
        const content = yaml.dump(data);
        return { ok: true, content, mime: "text/yaml;charset=utf-8", filename: `${name}.${t}` };
      }
      if ((from === "yml" || from === "yaml") && t === "json") {
        const yaml = await import("js-yaml");
        const data = yaml.load(text);
        const content = JSON.stringify(data, null, 2);
        return { ok: true, content, mime: "application/json", filename: `${name}.json` };
      }
    }

    if ((from === "yml" || from === "yaml") && (t === "yaml" || t === "yml" || t === "txt")) {
      return { ok: true, content: text, mime: "text/yaml;charset=utf-8", filename: `${name}.${t === "txt" ? "txt" : t}` };
    }

    if (from === "csv" && t === "tsv") {
      const rows = parseCsv(text, ",");
      return { ok: true, content: rowsToCsv(rows, "\t"), mime: "text/tab-separated-values;charset=utf-8", filename: `${name}.tsv` };
    }
    if (from === "tsv" && t === "csv") {
      const rows = parseCsv(text, "\t");
      return { ok: true, content: rowsToCsv(rows, ","), mime: "text/csv;charset=utf-8", filename: `${name}.csv` };
    }
    if ((from === "csv" || from === "tsv") && t === "md") {
      const rows = parseCsv(text, from === "tsv" ? "\t" : ",");
      return { ok: true, content: rowsToMarkdown(rows), mime: "text/markdown;charset=utf-8", filename: `${name}.md` };
    }
    if ((from === "csv" || from === "tsv") && t === "json") {
      const rows = parseCsv(text, from === "tsv" ? "\t" : ",");
      const [header, ...body] = rows;
      const objs = body.map((r) => Object.fromEntries(header.map((h, i) => [String(h), r[i] ?? ""])));
      return { ok: true, content: JSON.stringify(objs, null, 2), mime: "application/json", filename: `${name}.json` };
    }

    if ((from === "md" || from === "markdown") && t === "html" && mdToHtml) {
      const html = mdToHtml(text);
      return { ok: true, content: html, mime: "text/html;charset=utf-8", filename: `${name}.html` };
    }
    if ((from === "html" || from === "htm") && t === "md") {
      return { ok: true, content: htmlToMarkdownRough(text), mime: "text/markdown;charset=utf-8", filename: `${name}.md` };
    }
    if ((from === "html" || from === "htm") && t === "txt") {
      return { ok: true, content: htmlToText(text), mime: "text/plain;charset=utf-8", filename: `${name}.txt` };
    }
    if (t === "txt") {
      return { ok: true, content: text, mime: "text/plain;charset=utf-8", filename: `${name}.txt` };
    }
    if (t === "md") {
      return { ok: true, content: text, mime: "text/markdown;charset=utf-8", filename: `${name}.md` };
    }
    if (t === "html") {
      return { ok: true, content: text, mime: "text/html;charset=utf-8", filename: `${name}.html` };
    }
    if (t === "json") {
      try {
        const pretty = JSON.stringify(JSON.parse(text), null, 2);
        return { ok: true, content: pretty, mime: "application/json", filename: `${name}.json` };
      } catch {
        return { ok: true, content: JSON.stringify({ text }, null, 2), mime: "application/json", filename: `${name}.json` };
      }
    }
    if (t === "xml") {
      if (from === "xml") return { ok: true, content: text, mime: "application/xml", filename: `${name}.xml` };
      return {
        ok: true,
        content: `<?xml version="1.0" encoding="UTF-8"?>\n<root><![CDATA[${text}]]></root>\n`,
        mime: "application/xml",
        filename: `${name}.xml`,
      };
    }

    if (from === "tar") {
      return {
        ok: false,
        content: "",
        mime: "text/plain",
        filename: "error.txt",
        error: "TAR archives can be downloaded; full browser extraction is not enabled in this build.",
      };
    }

    return {
      ok: false,
      content: "",
      mime: "text/plain",
      filename: "error.txt",
      error: `No converter implemented for .${from} → .${t}`,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Conversion failed.";
    return { ok: false, content: "", mime: "text/plain", filename: "error.txt", error: msg };
  }
}
