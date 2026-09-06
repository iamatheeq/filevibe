import { create } from "zustand";

type UiState = {
  sidebarCollapsed: boolean;
  mobileNavOpen: boolean;
  splashDone: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  toggleSidebar: () => void;
  setMobileNavOpen: (v: boolean) => void;
  setSplashDone: (v: boolean) => void;
};

const saved =
  typeof localStorage !== "undefined" ? localStorage.getItem("mdc-sidebar-collapsed") === "1" : false;

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: saved,
  mobileNavOpen: false,
  splashDone: false,
  setSidebarCollapsed: (v) => {
    localStorage.setItem("mdc-sidebar-collapsed", v ? "1" : "0");
    set({ sidebarCollapsed: v });
  },
  toggleSidebar: () =>
    set((s) => {
      const next = !s.sidebarCollapsed;
      localStorage.setItem("mdc-sidebar-collapsed", next ? "1" : "0");
      return { sidebarCollapsed: next };
    }),
  setMobileNavOpen: (v) => set({ mobileNavOpen: v }),
  setSplashDone: (v) => set({ splashDone: v }),
}));
