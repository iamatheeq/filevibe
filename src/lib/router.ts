import { useEffect, useState } from "react";

export type AppRoute =
  | "/"
  | "/readme"
  | "/reader"
  | "/pdf"
  | "/images"
  | "/colors"
  | "/converter"
  | "/generator"
  | "/settings"
  | "/privacy"
  | "/help";

function pathFromHash(): AppRoute {
  const h = (window.location.hash || "#/").replace(/^#/, "") || "/";
  // legacy markdown preview → generator
  if (h.startsWith("/previewer")) return "/generator";
  const routes: AppRoute[] = [
    "/readme",
    "/reader",
    "/pdf",
    "/images",
    "/colors",
    "/converter",
    "/generator",
    "/settings",
    "/privacy",
    "/help",
  ];
  for (const r of routes) {
    if (h === r || h.startsWith(r + "/")) return r;
  }
  return "/";
}

export function useHashRoute(): [AppRoute, (to: AppRoute) => void] {
  const [route, setRoute] = useState<AppRoute>(pathFromHash);
  useEffect(() => {
    const onHash = () => setRoute(pathFromHash());
    window.addEventListener("hashchange", onHash);
    if (!window.location.hash) window.location.hash = "#/";
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const navigate = (to: AppRoute) => {
    window.location.hash = `#${to}`;
  };
  return [route, navigate];
}

export function routeTitle(route: AppRoute): string {
  const map: Record<AppRoute, string> = {
    "/": "Dashboard",
    "/readme": "GitHub Reader",
    "/reader": "File Reader",
    "/pdf": "PDF Editor",
    "/images": "Image Tool",
    "/colors": "Color Studio",
    "/converter": "File Converter",
    "/generator": "Markdown Generator",
    "/settings": "Settings",
    "/privacy": "Privacy",
    "/help": "Help",
  };
  return map[route] || "FileVibe";
}
