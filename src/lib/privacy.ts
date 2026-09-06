/** Privacy helpers — local-first messaging and safe cleanup. */

export type ProcessingMode = "local" | "server";

export function processingLabel(mode: ProcessingMode): string {
  return mode === "local" ? "Private · Processed locally" : "Server processing required";
}

export function processingDetail(mode: ProcessingMode): string {
  return mode === "local"
    ? "Your file is processed inside this browser and is not uploaded to FileVibe servers for this operation."
    : "This operation requires secure server-side processing. Your file would be transmitted only after explicit consent.";
}

export function revokeUrl(url: string | null | undefined) {
  if (url && url.startsWith("blob:")) {
    try {
      URL.revokeObjectURL(url);
    } catch {
      /* ignore */
    }
  }
}

/** Never log file contents, passwords, or personal document text. */
export function safeErrorMessage(err: unknown, fallback = "Something went wrong."): string {
  if (err instanceof Error) {
    const m = err.message;
    // Strip potential content-like payloads
    if (m.length > 180) return fallback;
    if (/password|token|secret|key/i.test(m)) return fallback;
    return m || fallback;
  }
  return fallback;
}
