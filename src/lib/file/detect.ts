/** Local-only file detection: extension + MIME + magic bytes. Never executes content. */

export type FileCategory =
  | "text"
  | "code"
  | "markup"
  | "markdown"
  | "json"
  | "csv"
  | "html"
  | "css"
  | "image"
  | "audio"
  | "video"
  | "pdf"
  | "document"
  | "spreadsheet"
  | "presentation"
  | "archive"
  | "unknown";

export type DetectedFile = {
  name: string;
  extension: string;
  mime: string;
  size: number;
  category: FileCategory;
  label: string;
  signature?: string;
  processing: "local";
};

const EXT_MAP: Record<string, { category: FileCategory; label: string }> = {
  txt: { category: "text", label: "Plain text" },
  log: { category: "text", label: "Log file" },
  ini: { category: "text", label: "INI config" },
  cfg: { category: "text", label: "Config" },
  conf: { category: "text", label: "Config" },
  env: { category: "text", label: "Environment file" },
  md: { category: "markdown", label: "Markdown" },
  markdown: { category: "markdown", label: "Markdown" },
  html: { category: "html", label: "HTML" },
  htm: { category: "html", label: "HTML" },
  xml: { category: "markup", label: "XML" },
  svg: { category: "image", label: "SVG image" },
  css: { category: "css", label: "CSS" },
  scss: { category: "css", label: "SCSS" },
  less: { category: "css", label: "LESS" },
  json: { category: "json", label: "JSON" },
  json5: { category: "json", label: "JSON5" },
  yaml: { category: "text", label: "YAML" },
  yml: { category: "text", label: "YAML" },
  csv: { category: "csv", label: "CSV" },
  tsv: { category: "csv", label: "TSV" },
  js: { category: "code", label: "JavaScript" },
  jsx: { category: "code", label: "JSX" },
  ts: { category: "code", label: "TypeScript" },
  tsx: { category: "code", label: "TSX" },
  py: { category: "code", label: "Python" },
  java: { category: "code", label: "Java" },
  cs: { category: "code", label: "C#" },
  cpp: { category: "code", label: "C++" },
  c: { category: "code", label: "C" },
  h: { category: "code", label: "C header" },
  go: { category: "code", label: "Go" },
  rs: { category: "code", label: "Rust" },
  php: { category: "code", label: "PHP" },
  rb: { category: "code", label: "Ruby" },
  kt: { category: "code", label: "Kotlin" },
  swift: { category: "code", label: "Swift" },
  sql: { category: "code", label: "SQL" },
  sh: { category: "code", label: "Shell" },
  bash: { category: "code", label: "Bash" },
  ps1: { category: "code", label: "PowerShell" },
  pdf: { category: "pdf", label: "PDF document" },
  docx: { category: "document", label: "Word document" },
  doc: { category: "document", label: "Word document (legacy)" },
  odt: { category: "document", label: "OpenDocument text" },
  rtf: { category: "document", label: "Rich text" },
  xlsx: { category: "spreadsheet", label: "Excel spreadsheet" },
  xls: { category: "spreadsheet", label: "Excel (legacy)" },
  ods: { category: "spreadsheet", label: "OpenDocument spreadsheet" },
  pptx: { category: "presentation", label: "PowerPoint" },
  ppt: { category: "presentation", label: "PowerPoint (legacy)" },
  odp: { category: "presentation", label: "OpenDocument presentation" },
  png: { category: "image", label: "PNG image" },
  jpg: { category: "image", label: "JPEG image" },
  jpeg: { category: "image", label: "JPEG image" },
  webp: { category: "image", label: "WebP image" },
  avif: { category: "image", label: "AVIF image" },
  gif: { category: "image", label: "GIF image" },
  ico: { category: "image", label: "Icon" },
  bmp: { category: "image", label: "Bitmap" },
  tiff: { category: "image", label: "TIFF image" },
  tif: { category: "image", label: "TIFF image" },
  mp3: { category: "audio", label: "MP3 audio" },
  wav: { category: "audio", label: "WAV audio" },
  ogg: { category: "audio", label: "OGG audio" },
  m4a: { category: "audio", label: "M4A audio" },
  flac: { category: "audio", label: "FLAC audio" },
  mp4: { category: "video", label: "MP4 video" },
  webm: { category: "video", label: "WebM video" },
  mov: { category: "video", label: "QuickTime video" },
  avi: { category: "video", label: "AVI video" },
  zip: { category: "archive", label: "ZIP archive" },
};

function hexSig(bytes: Uint8Array, n: number): string {
  return Array.from(bytes.slice(0, n))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(" ")
    .toUpperCase();
}

function magicCategory(bytes: Uint8Array): { category?: FileCategory; label?: string; signature: string } {
  const sig = hexSig(bytes, Math.min(8, bytes.length));
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    return { category: "pdf", label: "PDF document", signature: sig };
  }
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return { category: "image", label: "PNG image", signature: sig };
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { category: "image", label: "JPEG image", signature: sig };
  }
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
    return { category: "image", label: "GIF image", signature: sig };
  }
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
    return { category: "image", label: "RIFF media (WebP/WAV/AVI)", signature: sig };
  }
  if (bytes[0] === 0x50 && bytes[1] === 0x4b && (bytes[2] === 0x03 || bytes[2] === 0x05 || bytes[2] === 0x07)) {
    // ZIP-based: could be zip/docx/xlsx/pptx
    return { category: "archive", label: "ZIP-based package", signature: sig };
  }
  if (bytes[0] === 0x1f && bytes[1] === 0x8b) {
    return { category: "archive", label: "GZIP archive", signature: sig };
  }
  return { signature: sig };
}

export async function detectFile(file: File): Promise<DetectedFile> {
  const name = file.name || "untitled";
  const ext = (name.includes(".") ? name.split(".").pop()! : "").toLowerCase();
  const fromExt = EXT_MAP[ext];
  let category: FileCategory = fromExt?.category ?? "unknown";
  let label = fromExt?.label ?? (ext ? `${ext.toUpperCase()} file` : "Unknown file");
  let signature: string | undefined;

  try {
    const buf = await file.slice(0, 16).arrayBuffer();
    const bytes = new Uint8Array(buf);
    if (bytes.length) {
      const magic = magicCategory(bytes);
      signature = magic.signature;
      // Prefer magic when extension is missing or conflicts on strong signatures
      if (magic.category && (!fromExt || category === "unknown" || category === "archive")) {
        // ZIP magic + office extensions
        if (magic.category === "archive" && ["docx"].includes(ext)) {
          category = "document";
          label = "Word document";
        } else if (magic.category === "archive" && ["xlsx"].includes(ext)) {
          category = "spreadsheet";
          label = "Excel spreadsheet";
        } else if (magic.category === "archive" && ["pptx"].includes(ext)) {
          category = "presentation";
          label = "PowerPoint";
        } else if (magic.category === "archive" && ext === "zip") {
          category = "archive";
          label = "ZIP archive";
        } else if (magic.category !== "archive" || !fromExt) {
          category = magic.category;
          if (magic.label) label = magic.label;
        }
      }
    }
  } catch {
    /* ignore read errors — still return extension-based detection */
  }

  return {
    name,
    extension: ext,
    mime: file.type || "application/octet-stream",
    size: file.size,
    category,
    label,
    signature,
    processing: "local",
  };
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(2)} MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
