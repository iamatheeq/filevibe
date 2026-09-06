import { useEffect, useMemo, useState, useTransition, type ReactNode } from "react";
import { COLOR_PRESETS } from "../lib/defaults";
import { TECH_CATEGORIES } from "../lib/tech";
import { useGenerator } from "../lib/store";
import type { SectionKey } from "../lib/types";
import { cn } from "../lib/utils";
import { copyText, downloadText, renderMarkdownSafe } from "../lib/renderMd";
import { toast } from "../lib/toast";
import { SkeletonProfile } from "../components/ui/Skeleton";

const SECTION_LABELS: { key: SectionKey; label: string }[] = [
  { key: "avatar", label: "Profile photo" },
  { key: "banner", label: "Banner" },
  { key: "typing", label: "Typing headline" },
  { key: "about", label: "About / resume body" },
  { key: "analytics", label: "Profile analytics table" },
  { key: "contact", label: "Contact badges" },
  { key: "stats", label: "GitHub stats card" },
  { key: "langs", label: "Top languages" },
  { key: "streak", label: "Contribution streak" },
  { key: "activity", label: "Activity graph" },
  { key: "snake", label: "Contribution snake" },
  { key: "repos", label: "Featured repositories" },
  { key: "visitors", label: "Visitor badge" },
  { key: "updated", label: "Last-updated stamp" },
  { key: "extraMd", label: "Extra markdown block" },
];

function Label({ children }: { children: ReactNode }) {
  return (
    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
      {children}
    </label>
  );
}

function FieldGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-6">
      <h3 className="mb-3 text-[13px] font-semibold tracking-[-0.01em]">{title}</h3>
      {children}
    </section>
  );
}

export default function ReadmeGenerator() {
  const g = useGenerator();
  const { config, markdown, status, mobileTab, user } = g;
  const [customLabel, setCustomLabel] = useState("");
  const [customSlug, setCustomSlug] = useState("");
    const [, startTransition] = useTransition();

  // Do NOT auto-fetch on mount (avoids GitHub rate-limit console noise). User clicks Generate.
  const previewHtml = useMemo(() => renderMarkdownSafe(markdown), [markdown]);

  const switchTab = (tab: "edit" | "preview") => {
    startTransition(() => g.setMobileTab(tab));
  };

  const copyMd = async () => {
    if (!markdown) return;
    const r = await copyText(markdown);
    toast(r.ok ? "success" : "error", r.message);
  };
  const downloadMd = () => {
    if (!markdown) return;
    downloadText("README.md", markdown);
    toast("success", "README.md downloaded");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2">
      <div className="flex gap-2 border-b border-white/5 px-4 py-2 sm:hidden">
        <button type="button" className={cn("btn flex-1 text-[12px]", mobileTab === "edit" ? "btn-primary" : "btn-ghost")} onClick={() => switchTab("edit")}>
          Edit
        </button>
        <button type="button" className={cn("btn flex-1 text-[12px]", mobileTab === "preview" ? "btn-primary" : "btn-ghost")} onClick={() => switchTab("preview")}>
          Preview
        </button>
      </div>

      <section
        className={cn(
          "scrollbar-thin overflow-y-auto border-r border-[var(--color-border)] p-4 sm:p-6 pane-height lg:max-h-[calc(100dvh-8rem)]",
          mobileTab === "preview" ? "hidden lg:block" : "block",
        )}
      >
        <FieldGroup title="GitHub identity">
          <Label>Username</Label>
          <div className="mb-3 flex gap-2">
            <input
              className="field"
              value={config.username}
              onChange={(e) => g.setField("username", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void g.generate()}
              placeholder="GitHub username"
              aria-label="GitHub username"
            />
            <button type="button" className="btn btn-primary whitespace-nowrap" disabled={status.kind === "loading"} onClick={() => void g.generate()}>
              {status.kind === "loading" ? "Loading…" : "Generate"}
            </button>
            <button type="button" className="btn btn-ghost whitespace-nowrap" onClick={() => g.resetConfig()} title="Reset form">
              Reset
            </button>
          </div>
          {status.message && (
            <p className={cn("text-[12px]", status.kind === "error" ? "text-red-400" : "text-[var(--color-primary-hover)]")}>{status.message}</p>
          )}
        </FieldGroup>

        <FieldGroup title="Resume copy">
          <Label>Tagline</Label>
          <input className="field mb-3" value={config.tagline} onChange={(e) => g.setField("tagline", e.target.value)} />
          <Label>About</Label>
          <textarea className="field mb-3 min-h-[88px] resize-y" value={config.about} onChange={(e) => g.setField("about", e.target.value)} />
          <Label>Currently focused on</Label>
          <input className="field mb-3" value={config.focus} onChange={(e) => g.setField("focus", e.target.value)} />
          <Label>Typing lines (semicolon-separated)</Label>
          <input className="field" value={config.typingLines} onChange={(e) => g.setField("typingLines", e.target.value)} />
        </FieldGroup>

        <FieldGroup title="Contact & media">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input className="field" placeholder="Email" value={config.email} onChange={(e) => g.setField("email", e.target.value)} />
            <input className="field" placeholder="Mobile / WhatsApp" value={config.mobile} onChange={(e) => g.setField("mobile", e.target.value)} />
            <input className="field" placeholder="LinkedIn" value={config.linkedin} onChange={(e) => g.setField("linkedin", e.target.value)} />
            <input className="field" placeholder="Location" value={config.location} onChange={(e) => g.setField("location", e.target.value)} />
            <input className="field" placeholder="Website" value={config.website} onChange={(e) => g.setField("website", e.target.value)} />
            <input className="field" placeholder="Resume URL" value={config.resume} onChange={(e) => g.setField("resume", e.target.value)} />
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label>Avatar mode</Label>
              <select className="field" value={config.avatarMode} onChange={(e) => g.setField("avatarMode", e.target.value as typeof config.avatarMode)}>
                <option value="github">GitHub avatar</option>
                <option value="custom">Custom URL</option>
                <option value="off">Off</option>
              </select>
            </div>
            <div>
              <Label>Custom avatar URL</Label>
              <input className="field" value={config.customAvatarUrl} onChange={(e) => g.setField("customAvatarUrl", e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label>Banner image URL (optional)</Label>
              <input
                className="field"
                value={config.customBannerUrl}
                onChange={(e) => g.setField("customBannerUrl", e.target.value)}
                placeholder="https://raw.githubusercontent.com/you/repo/main/banner.png"
              />
              <p className="mt-1.5 text-[11px] text-[var(--color-text-muted)]">
                Prefer GitHub raw URLs. Leave empty to skip banner when the section is on.
              </p>
            </div>
          </div>
          <div className="mt-3">
            <div className="mb-2 flex items-center justify-between">
              <Label>Extra images (gallery)</Label>
              <button type="button" className="btn btn-ghost text-[11px]" onClick={g.addExtraImage}>
                Add image
              </button>
            </div>
            {config.extraImages.map((img) => (
              <div key={img.id} className="mb-2 flex gap-2">
                <input className="field" placeholder="Alt" value={img.alt} onChange={(e) => g.updateExtraImage(img.id, { alt: e.target.value })} />
                <input className="field" placeholder="URL" value={img.url} onChange={(e) => g.updateExtraImage(img.id, { url: e.target.value })} />
                <button type="button" className="btn btn-ghost" onClick={() => g.removeExtraImage(img.id)} aria-label="Remove image">
                  ✕
                </button>
              </div>
            ))}
          </div>
        </FieldGroup>

        <FieldGroup title="Colors">
          <div className="mb-3 flex flex-wrap gap-2">
            {COLOR_PRESETS.map((p) => (
              <button key={p.name} type="button" className="chip" onClick={() => g.setPalette(p.palette)}>
                <span className="inline-block h-3 w-3 rounded-full" style={{ background: p.palette.logoColor }} />
                {p.name}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {(
              [
                ["badgeBg", "Badge bg"],
                ["logoColor", "Accent"],
                ["bannerText", "Banner text"],
                ["typingColor", "Typing"],
                ["visitorColor", "Visitor"],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <Label>{label}</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.palette[key].startsWith("#") ? config.palette[key] : "#0a84ff"}
                    onChange={(e) => g.setPalette({ ...config.palette, [key]: e.target.value })}
                    className="h-9 w-10 cursor-pointer rounded border-0 bg-transparent"
                  />
                  <input className="field" value={config.palette[key]} onChange={(e) => g.setPalette({ ...config.palette, [key]: e.target.value })} />
                </div>
              </div>
            ))}
          </div>
        </FieldGroup>

        <FieldGroup title="Tech stack">
          {Object.entries(TECH_CATEGORIES).map(([cat, items]) => (
            <details key={cat} className="mb-2" open={cat === "Frontend"}>
              <summary className="cursor-pointer list-none py-1 text-[12px] text-[var(--color-primary-hover)]">{cat}</summary>
              <div className="flex flex-wrap gap-1.5 py-2">
                {items.map(([label]) => (
                  <button key={label} type="button" className={cn("chip", config.selectedTech.includes(label) && "on")} onClick={() => g.toggleTech(label)}>
                    {label}
                  </button>
                ))}
              </div>
            </details>
          ))}
          {config.customTech.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {config.customTech.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={cn("chip", config.selectedTech.includes(t.label) && "on")}
                  onClick={() => g.toggleTech(t.label)}
                  onDoubleClick={() => g.removeCustomTech(t.label)}
                  title="Double-click to remove"
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
          <div className="mt-2 flex gap-2">
            <input className="field" placeholder="Custom tech" value={customLabel} onChange={(e) => setCustomLabel(e.target.value)} />
            <input className="field" placeholder="icon slug" value={customSlug} onChange={(e) => setCustomSlug(e.target.value)} />
            <button
              type="button"
              className="btn btn-ghost whitespace-nowrap"
              onClick={() => {
                g.addCustomTech({ label: customLabel, slug: customSlug, category: "Custom" });
                setCustomLabel("");
                setCustomSlug("");
              }}
            >
              Add
            </button>
          </div>
        </FieldGroup>

        <FieldGroup title="Stats">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <select className="field" value={config.statsProvider} onChange={(e) => g.setField("statsProvider", e.target.value as typeof config.statsProvider)}>
              <option value="extended">GitHub Stats Extended</option>
              <option value="official">github-readme-stats</option>
              <option value="action">Self-hosted Action SVGs</option>
            </select>
            <select className="field" value={config.statsTheme} onChange={(e) => g.setField("statsTheme", e.target.value)}>
              <option value="dark">Dark</option>
              <option value="radical">Radical</option>
              <option value="tokyonight">Tokyo Night</option>
              <option value="default">Default</option>
            </select>
          </div>
        </FieldGroup>

        <FieldGroup title="Sections">
          <div className="divide-y divide-white/5 rounded-2xl glass-elevated px-3">
            {SECTION_LABELS.map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between py-2.5 text-[13px]">
                <span>{label}</span>
                <div
                  className={cn("sw", config.sections[key] && "on")}
                  onClick={() => g.toggleSection(key)}
                  role="switch"
                  aria-checked={config.sections[key]}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      g.toggleSection(key);
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </FieldGroup>

        {config.sections.extraMd && (
          <FieldGroup title="Extra markdown">
            <textarea className="field min-h-[120px] font-mono text-[12px]" value={config.extraMd} onChange={(e) => g.setField("extraMd", e.target.value)} />
          </FieldGroup>
        )}

        <div className="sticky bottom-0 flex gap-2 bg-gradient-to-t from-[var(--color-background)] via-[var(--color-background)] to-transparent pb-4 pt-6">
          <button type="button" className="btn btn-ghost flex-1" onClick={() => void copyMd()} disabled={!markdown}>
            Copy Markdown
          </button>
          <button type="button" className="btn btn-primary flex-1" onClick={downloadMd} disabled={!markdown}>
            Download README.md
          </button>
        </div>
      </section>

      <section
        className={cn(
          "scrollbar-thin overflow-y-auto p-4 sm:p-6 pane-height lg:max-h-[calc(100dvh-8rem)]",
          mobileTab === "edit" ? "hidden lg:block" : "block",
        )}
      >
        <div className="fv-animate-in min-h-[70vh] rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-lg sm:p-8">
          {status.kind === "loading" ? (
              <SkeletonProfile />
            ) : !markdown ? (
            <div className="fv-animate-in flex h-full min-h-[50vh] flex-col items-center justify-center gap-3 px-4 text-center">
              <div className="grid size-14 place-items-center rounded-2xl text-white shadow-md" style={{ background: "linear-gradient(135deg,#800020,#D2143A)" }} aria-hidden>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0 1 12 6.8c.85 0 1.71.11 2.51.33 1.9-1.29 2.74-1.02 2.74-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z"/></svg>
              </div>
              <p className="text-lg font-semibold tracking-[-0.02em]">Explore a GitHub profile</p>
              <p className="max-w-sm text-[13px] leading-relaxed text-[var(--color-text-muted)]">
                Enter a username and generate a polished, GitHub-ready README. Preview uses FileVibe theme; export stays pure Markdown.
              </p>
            </div>
          ) : (
            <>
            {user && (
              <div className="fv-metric-grid mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { label: "Repos", value: user.public_repos },
                  { label: "Followers", value: user.followers },
                  { label: "Following", value: user.following },
                  { label: "Gists", value: user.public_gists },
                ].map((m) => (
                  <div key={m.label} className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2.5 text-center">
                    <p className="text-[18px] font-semibold tabular-nums tracking-tight text-[var(--color-text)]">{m.value}</p>
                    <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)]">{m.label}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="md-body fv-animate-in" dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </>
          )}
        </div>
      </section>
    </div>
  );
}
