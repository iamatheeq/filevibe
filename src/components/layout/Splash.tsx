import { useEffect, useState } from "react";
import { useUiStore } from "../../lib/uiStore";
import { FileVibeLogo } from "../brand/FileVibeLogo";

export function Splash() {
  const done = useUiStore((s) => s.splashDone);
  const setDone = useUiStore((s) => s.setSplashDone);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    if (done) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const showMs = reduce ? 150 : 800;
    const fadeMs = reduce ? 80 : 300;
    const t1 = window.setTimeout(() => setFade(true), showMs);
    const t2 = window.setTimeout(() => setDone(true), showMs + fadeMs);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [done, setDone]);

  if (done) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--color-background)] transition-opacity duration-300 ${fade ? "opacity-0" : "opacity-100"}`}
      role="status"
      aria-label="Loading FileVibe"
    >
      <div className="flex flex-col items-center gap-4 animate-splash">
        <FileVibeLogo className="scale-125" />
        <p className="text-[12px] font-medium uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
          Transform Anything. Create Everything.
        </p>
        <p className="mt-4 text-[12px] text-[var(--color-text-muted)]">
          Powered by <span className="font-medium" style={{ background: "linear-gradient(135deg,#06B6D4,#A855F7)", WebkitBackgroundClip: "text", color: "transparent" }}>Mugavai.co</span>
        </p>
      </div>
    </div>
  );
}
