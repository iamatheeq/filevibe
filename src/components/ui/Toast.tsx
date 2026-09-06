import { useToast } from "../../lib/toast";
import { cn } from "../../lib/utils";

const kindClass: Record<string, string> = {
  success: "border-[var(--color-success)]/40 bg-[var(--color-success)]/15 text-[var(--color-text)]",
  error: "border-[var(--color-error)]/40 bg-[var(--color-error)]/15 text-[var(--color-text)]",
  warning: "border-[var(--color-warning)]/40 bg-[var(--color-warning)]/15 text-[var(--color-text)]",
  info: "border-[var(--color-info)]/40 bg-[var(--color-info)]/15 text-[var(--color-text)]",
};

export function ToastHost() {
  const items = useToast((s) => s.items);
  const dismiss = useToast((s) => s.dismiss);
  if (!items.length) return null;
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[80] flex w-[min(100vw-2rem,22rem)] flex-col gap-2 sm:bottom-6 sm:right-6" aria-live="polite">
      {items.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto flex items-start gap-2 rounded-[var(--radius-lg)] border px-3.5 py-2.5 text-[13px] shadow-lg backdrop-blur-md animate-toast-in",
            kindClass[t.kind],
          )}
          role="status"
        >
          <span className="flex-1 leading-snug">{t.message}</span>
          <button type="button" className="opacity-60 hover:opacity-100" onClick={() => dismiss(t.id)} aria-label="Dismiss">
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
