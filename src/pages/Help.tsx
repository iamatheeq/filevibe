export default function Help() {
  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-6 lg:p-8">
      <h2 className="text-[18px] font-semibold tracking-[-0.02em]">Help</h2>
      <div className="mt-4 space-y-4 text-[13px] leading-relaxed text-[var(--color-text-muted)]">
        <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <h3 className="font-semibold text-[var(--color-text)]">Keyboard shortcuts</h3>
          <ul className="mt-2 space-y-1">
            <li>
              <kbd className="rounded border border-[var(--color-border)] px-1.5 py-0.5 text-[11px]">Esc</kbd> — Close drawers and dropdowns
            </li>
            <li>
              <kbd className="rounded border border-[var(--color-border)] px-1.5 py-0.5 text-[11px]">Enter</kbd> — Generate README when focused on username
            </li>
            <li>
              <kbd className="rounded border border-[var(--color-border)] px-1.5 py-0.5 text-[11px]">Ctrl/⌘</kbd> +{" "}
              <kbd className="rounded border border-[var(--color-border)] px-1.5 py-0.5 text-[11px]">S</kbd> — Download current Markdown (where supported)
            </li>
          </ul>
        </section>
        <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <h3 className="font-semibold text-[var(--color-text)]">GitHub rate limits</h3>
          <p className="mt-1">
            Unauthenticated API calls are limited. If GitHub is unavailable, MD Craft still builds a README from your form fields.
          </p>
        </section>
        <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <h3 className="font-semibold text-[var(--color-text)]">About</h3>
          <p className="mt-1">
            MD Craft — Elevating Markdown. Powered by{" "}
            <a className="text-[var(--color-primary)]" href="https://www.mugavai.co/" target="_blank" rel="noreferrer">
              Mugavai.co
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
