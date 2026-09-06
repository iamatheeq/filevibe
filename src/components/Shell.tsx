import { useEffect, useState, type ReactNode } from "react";
import { HiOutlineBars3, HiOutlineXMark } from "react-icons/hi2";
import { COMPANY } from "../lib/defaults";
import { routeTitle, useHashRoute } from "../lib/router";
import { useUiStore } from "../lib/uiStore";
import { cn } from "../lib/utils";
import { Sidebar } from "./layout/Sidebar";
import { Splash } from "./layout/Splash";
import { Button } from "./ui/Button";
import { ToastHost } from "./ui/Toast";
import { FileVibeLogo } from "./brand/FileVibeLogo";
import { useInstallStore } from "../lib/installStore";

export function Shell({ children }: { children?: ReactNode }) {
  const [route] = useHashRoute();
  const mobileOpen = useUiStore((s) => s.mobileNavOpen);
  const setMobileOpen = useUiStore((s) => s.setMobileNavOpen);
    const [offline, setOffline] = useState(!navigator.onLine);
  const deferred = useInstallStore((s) => s.deferred);
  const installed = useInstallStore((s) => s.installed);
  const promptInstall = useInstallStore((s) => s.promptInstall);

  useEffect(() => {
    const theme = localStorage.getItem("pc-theme") || "system";
    document.documentElement.setAttribute("data-theme", theme);
  }, []);

  useEffect(() => {
    const onOnline = () => setOffline(false);
    const onOffline = () => setOffline(true);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      
    };
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen, setMobileOpen]);

    return (
    <>
      <Splash />
      <div className="flex h-[100dvh] flex-col overflow-hidden bg-[var(--color-background)] text-[var(--color-text)]">
        <header
          className="z-30 flex h-12 shrink-0 items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-2 sm:px-3"
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <HiOutlineXMark className="size-5" /> : <HiOutlineBars3 className="size-5" />}
          </Button>

          <FileVibeLogo className="min-w-0" />

          <div className="hidden h-5 w-px bg-[var(--color-border)] sm:block" aria-hidden />

          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold tracking-[-0.02em]">{routeTitle(route)}</p>
          </div>

          <div className="flex items-center gap-1.5">
            {offline && (
              <span className="rounded-full bg-[var(--color-warning)]/15 px-2 py-0.5 text-[11px] text-[var(--color-warning)]">
                Offline
              </span>
            )}
            {deferred && !installed && (
              <Button size="sm" onClick={() => void promptInstall()}>
                Install
              </Button>
            )}
          </div>
        </header>

        <div className="relative flex min-h-0 flex-1">
          <div className="hidden lg:block">
            <Sidebar mode="desktop" />
          </div>
          <div className={cn("fixed inset-0 z-40 lg:hidden", mobileOpen ? "pointer-events-auto" : "pointer-events-none")}>
            <div
              className={cn("absolute inset-0 bg-black/40 transition-opacity duration-200", mobileOpen ? "opacity-100" : "opacity-0")}
              onClick={() => setMobileOpen(false)}
              aria-hidden
            />
            <div
              className={cn("absolute inset-y-0 left-0 transition-transform duration-200 ease-out", mobileOpen ? "translate-x-0" : "-translate-x-full")}
              style={{ paddingTop: "env(safe-area-inset-top)" }}
            >
              <Sidebar mode="drawer" />
            </div>
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">{children}</div>
            <footer
              className="shrink-0 border-t border-[var(--color-border)] px-3 py-2 text-center text-[11px] text-[var(--color-text-muted)]"
              style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
            >
              FileVibe · Powered by{" "}
              <a className="text-[var(--color-primary-hover)] hover:underline" href={COMPANY.website} target="_blank" rel="noreferrer">
                Mugavai.co
              </a>
            </footer>
          </div>
        </div>
      </div>
      <ToastHost />
    </>
  );
}
