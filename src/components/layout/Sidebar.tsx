import {
  HiOutlineHome,
  HiOutlineUserCircle,
  HiOutlineFolderOpen,
  HiOutlineDocument,
  HiOutlinePhoto,
  HiOutlineSwatch,
  HiOutlineArrowsRightLeft,
  HiOutlineSparkles,
  HiOutlineCog6Tooth,
  HiOutlineShieldCheck,
  HiOutlineQuestionMarkCircle,
  HiOutlineArrowDownTray,
  HiOutlineChevronDoubleLeft,
  HiOutlineChevronDoubleRight,
} from "react-icons/hi2";
import { type AppRoute, useHashRoute } from "../../lib/router";
import { useUiStore } from "../../lib/uiStore";
import { cn } from "../../lib/utils";
import { Tooltip } from "../ui/Tooltip";
import { Button } from "../ui/Button";
import { useState } from "react";
import { isIos, useInstallStore } from "../../lib/installStore";
import { toast } from "../../lib/toast";

const PRIMARY: { to: AppRoute; label: string; icon: typeof HiOutlineHome }[] = [
  { to: "/", label: "Dashboard", icon: HiOutlineHome },
  { to: "/readme", label: "GitHub Reader", icon: HiOutlineUserCircle },
  { to: "/reader", label: "File Reader", icon: HiOutlineFolderOpen },
  { to: "/pdf", label: "PDF Editor", icon: HiOutlineDocument },
  { to: "/images", label: "Image Tool", icon: HiOutlinePhoto },
  { to: "/colors", label: "Color Studio", icon: HiOutlineSwatch },
  { to: "/converter", label: "File Converter", icon: HiOutlineArrowsRightLeft },
  { to: "/generator", label: "Markdown Generator", icon: HiOutlineSparkles },
];

const SECONDARY: { to: AppRoute; label: string; icon: typeof HiOutlineHome }[] = [
  { to: "/settings", label: "Settings", icon: HiOutlineCog6Tooth },
  { to: "/privacy", label: "Privacy", icon: HiOutlineShieldCheck },
  { to: "/help", label: "Help", icon: HiOutlineQuestionMarkCircle },
];

export function Sidebar({ mode }: { mode: "desktop" | "drawer" }) {
  const [route, navigate] = useHashRoute();
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggle = useUiStore((s) => s.toggleSidebar);
  const setMobileOpen = useUiStore((s) => s.setMobileNavOpen);
  const narrow = mode === "desktop" && collapsed;
  const deferred = useInstallStore((s) => s.deferred);
  const installed = useInstallStore((s) => s.installed);
  const prompting = useInstallStore((s) => s.prompting);
  const promptInstall = useInstallStore((s) => s.promptInstall);
  const [showIosHelp, setShowIosHelp] = useState(false);
    const go = (to: AppRoute) => {
    navigate(to);
    if (mode === "drawer") setMobileOpen(false);
  };

  const install = async () => {
    if (installed) return;
    if (isIos()) {
      setShowIosHelp(true);
      return;
    }
    const result = await promptInstall();
    if (result === "accepted") toast("success", "FileVibe installed");
    else if (result === "dismissed") toast("info", "Install dismissed");
    else if (isIos()) setShowIosHelp(true);
    else {
      setShowIosHelp(true);
      toast("info", "Use the browser install menu (Chrome: address bar install icon) or follow the steps below.");
    }
  };

  const NavBtn = ({ to, label, icon: Icon }: (typeof PRIMARY)[0]) => {
    const active = route === to;
    const btn = (
      <button
        type="button"
        onClick={() => go(to)}
        className={cn(
          "flex w-full items-center gap-3 rounded-[var(--radius-md)] px-2.5 py-2 text-[13px] font-medium transition-colors",
          active ? "text-white shadow-sm" : "text-[var(--color-text-muted)] hover:bg-[var(--color-field)] hover:text-[var(--color-text)]",
          narrow && "justify-center px-0",
        )}
        style={active ? { background: "var(--color-brand-gradient, linear-gradient(135deg,#800020,#D2143A))" } : undefined}
        aria-current={active ? "page" : undefined}
      >
        <Icon className="size-[18px] shrink-0" aria-hidden />
        {!narrow && <span className="truncate">{label}</span>}
      </button>
    );
    return narrow ? <Tooltip label={label}>{btn}</Tooltip> : btn;
  };

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)]",
        mode === "desktop" && (narrow ? "w-[64px]" : "w-[248px]"),
        mode === "drawer" && "w-[min(100vw-3rem,280px)]",
        "transition-[width] duration-200 ease-out",
      )}
    >
      {/* No logo — navigation only */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto overflow-x-hidden p-2 pt-3 scrollbar-thin" aria-label="Main">
        {PRIMARY.map((item) => (
          <NavBtn key={item.to} {...item} />
        ))}
        <div className="my-3 border-t border-[var(--color-border)]" />
        {SECONDARY.map((item) => (
          <NavBtn key={item.to} {...item} />
        ))}
        <div className="my-2 border-t border-[var(--color-border)]" />
        {narrow ? (
          <Tooltip label={installed ? "Installed" : installed ? "Installed" : deferred || isIos() ? "Install App" : "Install unavailable"}>
            <button
              type="button"
              className={cn(
                "flex w-full items-center justify-center rounded-[var(--radius-md)] px-0 py-2 text-[var(--color-text-muted)] hover:bg-[var(--color-field)]",
                !deferred && !installed && !isIos() && "opacity-50",
              )}
              onClick={() => void install()}
              disabled={installed || prompting}
              aria-label="Install App"
            >
              <HiOutlineArrowDownTray className="size-[18px]" />
            </button>
          </Tooltip>
        ) : (
          <button
            type="button"
            className={cn(
              "flex w-full items-center gap-3 rounded-[var(--radius-md)] px-2.5 py-2 text-[13px] font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-field)]",
              ((!deferred && !isIos()) || installed || prompting) && "opacity-60",
            )}
            onClick={() => void install()}
            disabled={installed || prompting}
          >
            <HiOutlineArrowDownTray className="size-[18px] shrink-0" />
            <span>{prompting ? "Installing…" : installed ? "App Installed" : deferred ? "Install App" : isIos() ? "How to Install" : "How to Install"}</span>
          </button>
        )}
      </nav>

      {showIosHelp && !narrow && (
        <div className="mx-2 mb-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-2 text-[10px] leading-snug text-[var(--color-text-muted)]">
          <p className="font-semibold text-[var(--color-text)]">Install FileVibe</p>
          {isIos() ? (
            <ol className="mt-1 list-decimal pl-4">
              <li>Tap Share</li>
              <li>Add to Home Screen</li>
              <li>Tap Add</li>
            </ol>
          ) : (
            <ol className="mt-1 list-decimal pl-4">
              <li>Use Chrome/Edge on HTTPS or localhost</li>
              <li>Click the install icon in the address bar</li>
              <li>Or wait for Install App to become active after engagement</li>
            </ol>
          )}
        </div>
      )}
      {mode === "desktop" && (
        <div className="border-t border-[var(--color-border)] p-2">
          <Button variant="ghost" size={narrow ? "icon" : "sm"} className="w-full" onClick={toggle} aria-label={narrow ? "Expand sidebar" : "Collapse sidebar"}>
            {narrow ? <HiOutlineChevronDoubleRight className="size-4" /> : (
              <>
                <HiOutlineChevronDoubleLeft className="size-4" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        </div>
      )}
    </aside>
  );
}
