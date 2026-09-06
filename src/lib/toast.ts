import { create } from "zustand";

export type ToastKind = "success" | "error" | "warning" | "info";

export type ToastItem = {
  id: string;
  kind: ToastKind;
  message: string;
};

type ToastState = {
  items: ToastItem[];
  push: (kind: ToastKind, message: string) => void;
  dismiss: (id: string) => void;
};

export const useToast = create<ToastState>((set) => ({
  items: [],
  push: (kind, message) => {
    const id = crypto.randomUUID();
    set((s) => ({ items: [...s.items, { id, kind, message }] }));
    window.setTimeout(() => {
      set((s) => ({ items: s.items.filter((t) => t.id !== id) }));
    }, 3200);
  },
  dismiss: (id) => set((s) => ({ items: s.items.filter((t) => t.id !== id) })),
}));

export function toast(kind: ToastKind, message: string) {
  useToast.getState().push(kind, message);
}
