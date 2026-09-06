import { useMemo, useState } from "react";
import { Button } from "../components/ui/Button";
import { toast } from "../lib/toast";
import { processingLabel } from "../lib/privacy";

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export default function ColorStudio() {
  const [hex, setHex] = useState("#06B6D4");
  const rgb = useMemo(() => {
    try {
      return hexToRgb(hex);
    } catch {
      return { r: 6, g: 182, b: 212 };
    }
  }, [hex]);
  const hsl = useMemo(() => rgbToHsl(rgb.r, rgb.g, rgb.b), [rgb]);

  const palette = useMemo(() => {
    const base = hsl.h;
    return [0, 30, 60, 120, 180].map((off) => {
      const h = (base + off) % 360;
      return `hsl(${h} ${hsl.s}% ${hsl.l}%)`;
    });
  }, [hsl]);

  const gradient = `linear-gradient(135deg, ${hex} 0%, #A855F7 100%)`;

  const copy = async (v: string) => {
    try {
      await navigator.clipboard.writeText(v);
      toast("success", "Copied");
    } catch {
      toast("error", "Unable to access clipboard");
    }
  };

  const eyeDrop = async () => {
    // EyeDropper API — Chromium
    const ED = (window as unknown as { EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> } }).EyeDropper;
    if (!ED) {
      toast("info", "EyeDropper is not supported in this browser.");
      return;
    }
    try {
      const res = await new ED().open();
      setHex(res.sRGBHex);
    } catch {
      /* user cancelled */
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-semibold">Color Studio</h2>
          <p className="text-[13px] text-[var(--color-text-muted)]">Picker, values, palette, gradients — local only</p>
        </div>
        <span className="rounded-full border border-[var(--color-border)] px-3 py-1 text-[11px] text-[var(--color-text-muted)]">
          {processingLabel("local")}
        </span>
      </div>

      <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <div className="flex flex-wrap items-center gap-4">
          <input type="color" value={hex} onChange={(e) => setHex(e.target.value)} className="h-14 w-14 cursor-pointer rounded-lg border-0 bg-transparent" />
          <input className="field max-w-[140px] font-mono" value={hex} onChange={(e) => setHex(e.target.value)} />
          <Button size="sm" variant="secondary" onClick={() => void eyeDrop()}>
            EyeDropper
          </Button>
        </div>

        <div className="mt-4 grid gap-2 text-[13px] sm:grid-cols-2">
          {[
            ["HEX", hex],
            ["RGB", `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`],
            ["HSL", `hsl(${hsl.h} ${hsl.s}% ${hsl.l}%)`],
          ].map(([k, v]) => (
            <button
              key={k}
              type="button"
              className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2 text-left hover:bg-[var(--color-field)]"
              onClick={() => void copy(v)}
            >
              <span className="text-[var(--color-text-muted)]">{k}</span>
              <span className="font-mono">{v}</span>
            </button>
          ))}
        </div>

        <h3 className="mt-5 text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">Palette</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {palette.map((c) => (
            <button key={c} type="button" className="size-10 rounded-lg border border-[var(--color-border)]" style={{ background: c }} title={c} onClick={() => void copy(c)} />
          ))}
        </div>

        <h3 className="mt-5 text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">Gradient</h3>
        <div className="mt-2 h-16 rounded-[var(--radius-lg)]" style={{ background: gradient }} />
        <Button size="sm" variant="outline" className="mt-2" onClick={() => void copy(gradient)}>
          Copy CSS
        </Button>
      </div>
    </div>
  );
}
