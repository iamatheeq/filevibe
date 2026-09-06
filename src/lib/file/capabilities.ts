import type { FileCategory } from "./detect";

export type FileCapabilities = {
  canView: boolean;
  canEdit: boolean;
  canConvert: boolean;
  canCompress: boolean;
  canResize: boolean;
  canPreview: boolean;
  canExtract: boolean;
  canExport: boolean;
  convertTargets: string[];
  viewMode: "text" | "code" | "markdown" | "json" | "csv" | "html" | "image" | "audio" | "video" | "pdf" | "binary" | "none";
  processing: "local" | "server";
  notes?: string;
};

const TEXTISH: FileCategory[] = ["text", "code", "markup", "markdown", "json", "csv", "html", "css"];

export function capabilitiesFor(category: FileCategory, extension: string): FileCapabilities {
  const base: FileCapabilities = {
    canView: false,
    canEdit: false,
    canConvert: false,
    canCompress: false,
    canResize: false,
    canPreview: false,
    canExtract: false,
    canExport: true,
    convertTargets: [],
    viewMode: "none",
    processing: "local",
  };

  if (TEXTISH.includes(category) || ["md", "txt", "log"].includes(extension)) {
    base.canView = true;
    base.canEdit = true;
    base.canPreview = true;
    base.canConvert = true;
    base.convertTargets = ["txt", "md", "html", "json"].filter((t) => t !== extension);
    if (category === "markdown") base.viewMode = "markdown";
    else if (category === "json") base.viewMode = "json";
    else if (category === "csv") {
      base.viewMode = "csv";
      base.convertTargets = ["csv", "md", "json", "txt"];
    } else if (category === "html") base.viewMode = "html";
    else if (category === "code" || category === "css") base.viewMode = "code";
    else base.viewMode = "text";
    return base;
  }

  if (category === "image") {
    base.canView = true;
    base.canPreview = true;
    base.canConvert = true;
    base.canCompress = ["png", "jpg", "jpeg", "webp"].includes(extension);
    base.canResize = ["png", "jpg", "jpeg", "webp", "gif", "bmp"].includes(extension);
    base.viewMode = "image";
    base.convertTargets = ["png", "jpg", "webp"].filter((t) => t !== extension);
    if (extension === "svg") {
      base.canCompress = false;
      base.canResize = false;
      base.notes = "SVG is viewed safely as an image blob; scripts are not executed.";
    }
    return base;
  }

  if (category === "audio") {
    base.canView = true;
    base.canPreview = true;
    base.viewMode = "audio";
    base.notes = "Playback uses browser-native audio; conversion not available client-side.";
    return base;
  }

  if (category === "video") {
    base.canView = true;
    base.canPreview = true;
    base.viewMode = "video";
    base.notes = "Playback uses browser-native video; conversion not available client-side.";
    return base;
  }

  if (category === "pdf") {
    base.canView = true;
    base.canPreview = true;
    base.viewMode = "pdf";
    base.notes = "PDF opens in the browser viewer. Full in-app PDF editing requires additional libraries (not claimed as complete Word/PDF suite).";
    return base;
  }

  if (category === "document" || category === "spreadsheet" || category === "presentation") {
    base.canView = false;
    base.canConvert = false;
    base.notes = "Office formats are accepted for analysis/download. Rich browser editing is not claimed without dedicated parsers.";
    return base;
  }

  if (category === "archive") {
    base.canExtract = false;
    base.notes = "Archives can be downloaded. Safe ZIP inspection can be added with a dedicated library; contents are never executed.";
    return base;
  }

  base.notes = "Format detected but in-browser preview is not supported. You can still download the file.";
  return base;
}
