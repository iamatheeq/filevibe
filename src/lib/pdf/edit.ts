/**
 * Real PDF mutation helpers (pdf-lib).
 * password option cast: typings lag behind some builds; runtime supports encrypted load when provided.
 */

export type TextHit = {
  str: string;
  x: number;
  y: number;
  w: number;
  h: number;
  pageIndex: number;
};

export type FormFieldInfo = {
  name: string;
  type: string;
  value: string;
};

type LoadOpts = { ignoreEncryption?: boolean; password?: string };

async function loadPdf(bytes: Uint8Array, password?: string) {
  const { PDFDocument } = await import("pdf-lib");
  const opts: LoadOpts = { ignoreEncryption: false };
  if (password) opts.password = password;
  return PDFDocument.load(bytes, opts as Parameters<typeof PDFDocument.load>[1]);
}

export async function listFormFields(bytes: Uint8Array, password?: string): Promise<FormFieldInfo[]> {
  const pdf = await loadPdf(bytes, password);
  const form = pdf.getForm();
  const fields = form.getFields();
  return fields.map((f) => {
    const name = f.getName();
    let value = "";
    const type = f.constructor.name;
    try {
      // @ts-expect-error pdf-lib field variants
      if (typeof f.getText === "function") value = f.getText() ?? "";
      // @ts-expect-error pdf-lib field variants
      else if (typeof f.isChecked === "function") value = f.isChecked() ? "true" : "false";
    } catch {
      /* ignore */
    }
    return { name, type, value };
  });
}

export async function setFormFieldValues(
  bytes: Uint8Array,
  values: Record<string, string>,
  password?: string,
): Promise<Uint8Array> {
  const pdf = await loadPdf(bytes, password);
  const form = pdf.getForm();
  for (const [name, val] of Object.entries(values)) {
    try {
      const field = form.getTextField(name);
      field.setText(val);
    } catch {
      try {
        const box = form.getCheckBox(name);
        if (val === "true" || val === "1" || val.toLowerCase() === "yes") box.check();
        else box.uncheck();
      } catch {
        /* skip */
      }
    }
  }
  form.flatten();
  return pdf.save();
}

export async function replaceTextHits(
  bytes: Uint8Array,
  hits: TextHit[],
  replacement: string,
  password?: string,
): Promise<Uint8Array> {
  const { StandardFonts, rgb } = await import("pdf-lib");
  const pdf = await loadPdf(bytes, password);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const pages = pdf.getPages();
  for (const hit of hits) {
    const page = pages[hit.pageIndex];
    if (!page) continue;
    page.drawRectangle({
      x: hit.x - 1,
      y: hit.y - 1,
      width: Math.max(hit.w + 2, 8),
      height: Math.max(hit.h + 2, 8),
      color: rgb(1, 1, 1),
      borderWidth: 0,
    });
    const size = Math.max(8, Math.min(hit.h || 12, 14));
    page.drawText(replacement, {
      x: hit.x,
      y: hit.y,
      size,
      font,
      color: rgb(0.1, 0.1, 0.1),
      maxWidth: Math.max(hit.w, 40),
    });
  }
  return pdf.save();
}

export async function extractTextHits(file: File): Promise<TextHit[]> {
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
  const hits: TextHit[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    for (const item of content.items) {
      if (typeof item !== "object" || item === null || !("str" in item)) continue;
      const str = String((item as { str: string }).str || "");
      if (!str.trim()) continue;
      const t = (item as { transform: number[] }).transform;
      const x = t[4];
      const y = t[5];
      const width = "width" in item ? Number((item as { width?: number }).width) : undefined;
      const w = width && width > 0 ? width : str.length * 6;
      const h = Math.abs(t[3]) || 12;
      hits.push({ str, x, y, w, h, pageIndex: i - 1 });
    }
  }
  return hits;
}

export function downloadPdfBytes(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
