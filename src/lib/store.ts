import { create } from "zustand";
import { DEFAULT_CONFIG } from "./defaults";
import { fetchTopRepos, fetchUser } from "./github";
import { buildMarkdown } from "./markdown";
import type {
  ExtraImage, GeneratorConfig, GitHubRepo, GitHubUser, Palette, SectionKey, TechItem,
} from "./types";

type Status = { kind: "idle" | "loading" | "ok" | "error"; message: string };

type State = {
  config: GeneratorConfig;
  user: GitHubUser | null;
  repos: GitHubRepo[];
  markdown: string;
  status: Status;
  mobileTab: "edit" | "preview";
  setField: <K extends keyof GeneratorConfig>(key: K, value: GeneratorConfig[K]) => void;
  setPalette: (palette: Palette) => void;
  toggleSection: (key: SectionKey) => void;
  toggleTech: (label: string) => void;
  addCustomTech: (item: Omit<TechItem, "id" | "custom">) => void;
  removeCustomTech: (label: string) => void;
  addExtraImage: () => void;
  updateExtraImage: (id: string, patch: Partial<ExtraImage>) => void;
  removeExtraImage: (id: string) => void;
  setMobileTab: (tab: "edit" | "preview") => void;
  generate: () => Promise<void>;
  resetConfig: () => void;
};

function rebuildMd(s: Pick<State, "user" | "repos" | "config">) {
  if (!s.user) return "";
  return buildMarkdown(s.user, s.repos, s.config);
}

/** Synthetic user from form fields when GitHub API is unavailable. */
function fallbackUser(config: GeneratorConfig): GitHubUser {
  const login = config.username.trim() || "user";
  return {
    login,
    name: login,
    bio: config.about.trim() || null,
    blog: config.website.trim() || null,
    twitter_username: null,
    avatar_url: `/favicon.svg`,
    public_repos: 0,
    public_gists: 0,
    followers: 0,
    following: 0,
    html_url: `https://github.com/${login}`,
    location: config.location.trim() || null,
    company: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

const initialConfig = (): GeneratorConfig => ({
  ...DEFAULT_CONFIG,
  sections: { ...DEFAULT_CONFIG.sections },
  palette: { ...DEFAULT_CONFIG.palette },
  selectedTech: [...DEFAULT_CONFIG.selectedTech],
  customTech: [],
  extraImages: [],
});

export const useGenerator = create<State>((set, get) => ({
  config: initialConfig(),
  user: null,
  repos: [],
  markdown: "",
  status: { kind: "idle", message: "" },
  mobileTab: "edit",

  setField: (key, value) => set((s) => {
    const config = { ...s.config, [key]: value };
    return { config, markdown: rebuildMd({ ...s, config }) };
  }),
  setPalette: (palette) => set((s) => {
    const config = { ...s.config, palette };
    return { config, markdown: rebuildMd({ ...s, config }) };
  }),
  toggleSection: (key) => set((s) => {
    const config = { ...s.config, sections: { ...s.config.sections, [key]: !s.config.sections[key] } };
    return { config, markdown: rebuildMd({ ...s, config }) };
  }),
  toggleTech: (label) => set((s) => {
    const has = s.config.selectedTech.includes(label);
    const selectedTech = has ? s.config.selectedTech.filter((t) => t !== label) : [...s.config.selectedTech, label];
    const config = { ...s.config, selectedTech };
    return { config, markdown: rebuildMd({ ...s, config }) };
  }),
  addCustomTech: (item) => set((s) => {
    const label = item.label.trim();
    if (!label || s.config.selectedTech.includes(label)) return s;
    const tech: TechItem = {
      id: `custom:${label}`, label,
      slug: item.slug || label.toLowerCase().replace(/[^a-z0-9]/g, ""),
      category: item.category || "Custom", custom: true,
    };
    const config = {
      ...s.config,
      customTech: [...s.config.customTech, tech],
      selectedTech: [...s.config.selectedTech, label],
    };
    return { config, markdown: rebuildMd({ ...s, config }) };
  }),
  removeCustomTech: (label) => set((s) => {
    const config = {
      ...s.config,
      customTech: s.config.customTech.filter((t) => t.label !== label),
      selectedTech: s.config.selectedTech.filter((t) => t !== label),
    };
    return { config, markdown: rebuildMd({ ...s, config }) };
  }),
  addExtraImage: () => set((s) => {
    const config = { ...s.config, extraImages: [...s.config.extraImages, { id: crypto.randomUUID(), alt: "", url: "" }] };
    return { config, markdown: rebuildMd({ ...s, config }) };
  }),
  updateExtraImage: (id, patch) => set((s) => {
    const config = { ...s.config, extraImages: s.config.extraImages.map((img) => img.id === id ? { ...img, ...patch } : img) };
    return { config, markdown: rebuildMd({ ...s, config }) };
  }),
  removeExtraImage: (id) => set((s) => {
    const config = { ...s.config, extraImages: s.config.extraImages.filter((img) => img.id !== id) };
    return { config, markdown: rebuildMd({ ...s, config }) };
  }),
  setMobileTab: (mobileTab) => set({ mobileTab }),
  resetConfig: () => set({
    config: initialConfig(),
    user: null,
    repos: [],
    markdown: "",
    status: { kind: "idle", message: "" },
    mobileTab: "edit",
  }),
  generate: async () => {
    const uname = get().config.username.trim();
    if (!uname) {
      set({ status: { kind: "error", message: "Enter a GitHub username first." } });
      return;
    }
    set({ status: { kind: "loading", message: "Fetching profile…" } });
    try {
      const user = await fetchUser(uname);
      const { repos, failed } = await fetchTopRepos(uname);
      const markdown = buildMarkdown(user, repos, get().config);
      set({
        user, repos, markdown, mobileTab: "preview",
        status: {
          kind: failed ? "ok" : "ok",
          message: failed
            ? `Loaded @${uname} — repo data unavailable (using empty repo list).`
            : `Loaded @${uname} · ${user.public_repos} repos · ${user.followers} followers`,
        },
      });
    } catch (e) {
      // Documented requirement: fall back to form data when GitHub API fails.
      const config = get().config;
      const user = fallbackUser(config);
      const markdown = buildMarkdown(user, [], config);
      const msg =
        e instanceof Error && e.message === "NOT_FOUND"
          ? `GitHub profile not found for @${uname}. Generated README from form fields instead.`
          : e instanceof Error && e.message.startsWith("API_")
            ? `GitHub API error (${e.message.slice(4)}). Generated README from form fields.`
            : "Network error. Generated README from form fields (offline fallback).";
      set({
        user,
        repos: [],
        markdown,
        mobileTab: "preview",
        status: { kind: "error", message: msg },
      });
    }
  },
}));
