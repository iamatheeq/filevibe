import { cn } from "../../lib/utils";

export function FileVibeLogo({ className, markOnly }: { className?: string; markOnly?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className="grid size-8 place-items-center rounded-[10px] text-white shadow-md"
        style={{ background: "linear-gradient(135deg, #800020 0%, #D2143A 100%)" }}
        aria-hidden
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M7 3h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" fill="white" fillOpacity=".95" />
          <path d="M14 3v5h5" stroke="#E8E8E8" strokeWidth="1.5" />
          <path d="M8 12h8M8 15h6M8 18h7" stroke="#800020" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>
      {!markOnly && (
        <div className="min-w-0 leading-tight">
          <p className="truncate text-[13px] font-semibold tracking-[-0.02em] text-[var(--color-text)]">FileVibe</p>
          <p className="truncate text-[10px] text-[var(--color-text-muted)]">Transform Anything</p>
        </div>
      )}
    </div>
  );
}
