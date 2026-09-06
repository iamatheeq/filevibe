import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "../../lib/utils";

export type DropdownOption = {
  value: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  searchable?: boolean;
  className?: string;
  "aria-label"?: string;
};

export function Dropdown({
  value,
  onChange,
  options,
  placeholder = "Select…",
  searchable = false,
  className,
  "aria-label": ariaLabel,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = options.find((o) => o.value === value);

  const filtered = searchable
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      const idx = Math.max(0, filtered.findIndex((o) => o.value === value));
      setActive(idx);
      setQuery("");
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const pick = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = filtered[active];
      if (opt && !opt.disabled) pick(opt.value);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        className={cn(
          "flex h-9 w-full items-center justify-between gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-field)] px-3 text-left text-[13px] text-[var(--color-text)]",
          "hover:border-[var(--color-primary)]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]",
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKeyDown}
      >
        <span className={cn(!selected && "text-[var(--color-text-muted)]")}>{selected?.label ?? placeholder}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0 opacity-60" aria-hidden>
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-1 shadow-xl backdrop-blur-xl"
        >
          {searchable && (
            <input
              className="mb-1 h-8 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-field)] px-2 text-[12px]"
              placeholder="Search…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              autoFocus
            />
          )}
          {filtered.length === 0 && (
            <div className="px-2 py-2 text-[12px] text-[var(--color-text-muted)]">No options</div>
          )}
          {filtered.map((opt, i) => (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={opt.value === value}
              disabled={opt.disabled}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px]",
                i === active && "bg-[var(--color-primary)]/15",
                opt.value === value && "font-medium text-[var(--color-primary)]",
                opt.disabled && "opacity-40",
                !opt.disabled && "hover:bg-[var(--color-primary)]/10",
              )}
              onMouseEnter={() => setActive(i)}
              onClick={() => !opt.disabled && pick(opt.value)}
            >
              {opt.icon}
              <span className="flex-1">{opt.label}</span>
              {opt.value === value && <span aria-hidden>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
