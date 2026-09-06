import { useEffect, useState } from "react";
import { Dropdown } from "../components/ui/Dropdown";
import { Button } from "../components/ui/Button";
import { toast } from "../lib/toast";
import { useUiStore } from "../lib/uiStore";

export default function Settings() {
  const [theme, setTheme] = useState(() => localStorage.getItem("pc-theme") || "system");
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const setCollapsed = useUiStore((s) => s.setSidebarCollapsed);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("pc-theme", theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    const isDark =
      theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (meta) meta.setAttribute("content", isDark ? "#121212" : "#FDFBF7");
  }, [theme]);

  return (
    <div className="mx-auto max-w-lg space-y-6 p-4 sm:p-6">
      <div>
        <h2 className="text-[18px] font-semibold">Settings</h2>
        <p className="text-[13px] text-[var(--color-text-muted)]">Preferences stay on this device.</p>
      </div>

      <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h3 className="text-[13px] font-semibold">Appearance</h3>
        <label className="mb-1.5 mt-3 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
          Theme
        </label>
        <Dropdown
          aria-label="Theme"
          value={theme}
          onChange={setTheme}
          options={[
            { value: "system", label: "System" },
            { value: "dark", label: "Dark" },
            { value: "light", label: "Light" },
          ]}
        />
      </section>

      <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h3 className="text-[13px] font-semibold">Navigation</h3>
        <label className="mb-1.5 mt-3 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
          Sidebar default
        </label>
        <Dropdown
          value={collapsed ? "collapsed" : "expanded"}
          onChange={(v) => setCollapsed(v === "collapsed")}
          options={[
            { value: "expanded", label: "Always expanded" },
            { value: "collapsed", label: "Always collapsed" },
          ]}
        />
      </section>

      <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h3 className="text-[13px] font-semibold">About</h3>
        <p className="mt-2 text-[13px] text-[var(--color-text-muted)]">
          FileVibe · Transform Anything. Create Everything. · Mugavai.co
        </p>
        <Button size="sm" variant="outline" className="mt-3" onClick={() => toast("info", "FileVibe 2.0 · local-first")}>
          Version info
        </Button>
      </section>
    </div>
  );
}
