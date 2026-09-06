import type { FileCategory } from "./detect";

export type ConvertPath = {
  from: string[];
  to: string;
  label: string;
  engine: "text" | "canvas" | "binary" | "none";
  notes?: string;
};

/** Only paths with real client-side implementations. */
export const CONVERSION_PATHS: ConvertPath[] = [
  // text family
  { from: ["md", "markdown", "txt", "log"], to: "html", label: "HTML", engine: "text" },
  { from: ["md", "markdown", "txt", "html", "htm", "json", "csv", "tsv", "xml", "yml", "yaml"], to: "txt", label: "Plain text", engine: "text" },
  { from: ["html", "htm", "txt", "csv", "tsv", "json"], to: "md", label: "Markdown", engine: "text" },
  { from: ["json", "csv", "tsv", "txt", "md", "yml", "yaml", "xml"], to: "json", label: "JSON", engine: "text" },
  { from: ["csv", "tsv", "json", "xlsx", "xls"], to: "csv", label: "CSV", engine: "text" },
  { from: ["csv", "tsv", "json"], to: "tsv", label: "TSV", engine: "text" },
  { from: ["txt", "md", "html", "json", "csv", "xml", "yml", "yaml"], to: "xml", label: "XML", engine: "text" },
  { from: ["yml", "yaml", "json"], to: "yaml", label: "YAML", engine: "text" },
  { from: ["json", "yml", "yaml"], to: "yml", label: "YML", engine: "text" },
  // documents
  { from: ["docx"], to: "txt", label: "Plain text", engine: "binary" },
  { from: ["docx"], to: "html", label: "HTML", engine: "binary" },
  { from: ["docx"], to: "md", label: "Markdown", engine: "binary" },
  // spreadsheets
  { from: ["xlsx", "xls", "xlsm", "xlsb", "csv", "tsv"], to: "csv", label: "CSV", engine: "binary" },
  { from: ["xlsx", "xls", "xlsm", "xlsb", "csv"], to: "tsv", label: "TSV", engine: "binary" },
  { from: ["xlsx", "xls", "xlsm", "xlsb", "csv", "tsv"], to: "json", label: "JSON", engine: "binary" },
  { from: ["xlsx", "xls", "xlsm", "xlsb", "csv", "tsv"], to: "html", label: "HTML table", engine: "binary" },
  { from: ["xlsx", "xls", "xlsm", "xlsb", "csv", "tsv"], to: "md", label: "Markdown table", engine: "binary" },
  { from: ["csv", "tsv", "json"], to: "xlsx", label: "Excel (XLSX)", engine: "binary" },
  // pdf
  { from: ["pdf"], to: "txt", label: "Extracted text", engine: "binary" },
  { from: ["pdf"], to: "html", label: "HTML (text extract)", engine: "binary" },
  { from: ["pdf"], to: "md", label: "Markdown (text extract)", engine: "binary" },
  { from: ["pdf"], to: "json", label: "JSON text pages", engine: "binary" },
  // images
  { from: ["png", "jpg", "jpeg", "webp", "gif", "bmp"], to: "jpg", label: "JPEG", engine: "canvas" },
  { from: ["png", "jpg", "jpeg", "webp", "gif", "bmp"], to: "png", label: "PNG", engine: "canvas" },
  { from: ["png", "jpg", "jpeg", "webp", "gif", "bmp"], to: "webp", label: "WebP", engine: "canvas" },
];

export function targetsForExtension(ext: string): ConvertPath[] {
  const e = ext.toLowerCase();
  return CONVERSION_PATHS.filter((p) => p.from.includes(e) && p.to !== e);
}

export function hasConverter(ext: string): boolean {
  return targetsForExtension(ext).length > 0;
}

export function categoryHint(cat: FileCategory): string {
  switch (cat) {
    case "image":
      return "Image conversions use the Canvas API locally.";
    case "pdf":
      return "PDF → text/HTML/Markdown/JSON via pdf.js text extraction (scanned PDFs need OCR).";
    case "document":
      return "DOCX text/HTML via mammoth. Macros are never executed.";
    case "spreadsheet":
      return "Spreadsheets via SheetJS (xlsx). Formulas become values; macros are not executed.";
    case "archive":
      return "Archives: inspect/download only. TAR full extraction is not enabled in this build.";
    default:
      return "Only listed outputs are implemented client-side.";
  }
}
