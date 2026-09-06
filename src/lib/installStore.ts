import { create } from "zustand";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type InstallState = {
  deferred: BeforeInstallPromptEvent | null;
  installed: boolean;
  prompting: boolean;
  setDeferred: (e: BeforeInstallPromptEvent | null) => void;
  setInstalled: (v: boolean) => void;
  setPrompting: (v: boolean) => void;
  promptInstall: () => Promise<"accepted" | "dismissed" | "unavailable">;
};

export const useInstallStore = create<InstallState>((set, get) => ({
  deferred: null,
  installed: false,
  prompting: false,
  setDeferred: (e) => set({ deferred: e }),
  setInstalled: (v) => set({ installed: v, deferred: v ? null : get().deferred }),
  setPrompting: (v) => set({ prompting: v }),
  promptInstall: async () => {
    const ev = get().deferred;
    if (!ev) return "unavailable";
    set({ prompting: true });
    try {
      await ev.prompt();
      const choice = await ev.userChoice;
      set({ prompting: false, deferred: null });
      if (choice.outcome === "accepted") set({ installed: true });
      return choice.outcome;
    } catch {
      set({ prompting: false });
      return "unavailable";
    }
  },
}));

/** Call once from app root. */
export function bindInstallListeners() {
  const mq = window.matchMedia("(display-mode: standalone)");
  const standalone =
    mq.matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
  if (standalone) useInstallStore.getState().setInstalled(true);

  const onBip = (e: Event) => {
    e.preventDefault();
    useInstallStore.getState().setDeferred(e as BeforeInstallPromptEvent);
  };
  const onInstalled = () => useInstallStore.getState().setInstalled(true);
  window.addEventListener("beforeinstallprompt", onBip);
  window.addEventListener("appinstalled", onInstalled);
  return () => {
    window.removeEventListener("beforeinstallprompt", onBip);
    window.removeEventListener("appinstalled", onInstalled);
  };
}

export function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}
