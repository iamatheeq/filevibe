import { useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/utils";

export function Tooltip({
  label,
  children,
  side = "right",
}: {
  label: string;
  children: ReactNode;
  side?: "right" | "bottom";
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const ref = useRef<HTMLSpanElement>(null);
  const id = useId();

  const show = () => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (side === "right") {
      setPos({ top: r.top + r.height / 2, left: r.right + 8 });
    } else {
      setPos({ top: r.bottom + 8, left: r.left + r.width / 2 });
    }
    setOpen(true);
  };

  return (
    <span
      ref={ref}
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={() => setOpen(false)}
      onFocus={show}
      onBlur={() => setOpen(false)}
      aria-describedby={open ? id : undefined}
    >
      {children}
      {open &&
        createPortal(
          <span
            id={id}
            role="tooltip"
            className={cn(
              "pointer-events-none fixed z-[200] whitespace-nowrap rounded-md border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-2 py-1 text-[11px] font-medium text-[var(--color-text)] shadow-lg",
            )}
            style={{
              top: pos.top,
              left: pos.left,
              transform: side === "right" ? "translateY(-50%)" : "translateX(-50%)",
            }}
          >
            {label}
          </span>,
          document.body,
        )}
    </span>
  );
}
