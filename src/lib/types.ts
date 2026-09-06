export type StatsProvider = "extended" | "official" | "action";
export type BannerStyle = "waving" | "rounded" | "rect" | "soft";
export type AvatarMode = "github" | "custom" | "off";
export type SectionKey =
  | "avatar" | "banner" | "typing" | "about" | "contact"
  | "analytics" | "stats" | "langs" | "streak" | "snake"
  | "repos" | "activity" | "visitors" | "updated" | "extraMd";
export type Sections = Record<SectionKey, boolean>;
export type Palette = {
  badgeBg: string; logoColor: string; bannerColor: string;
  bannerText: string; typingColor: string; visitorColor: string;
};
export type TechItem = { id: string; label: string; slug: string; category: string; custom?: boolean };
export type ExtraImage = { id: string; alt: string; url: string };
export type GeneratorConfig = {
  username: string; tagline: string; focus: string; about: string;
  website: string; email: string; mobile: string; linkedin: string;
  location: string; resume: string; bannerText: string; bannerStyle: BannerStyle;
  typingLines: string; avatarMode: AvatarMode; customAvatarUrl: string;
  customBannerUrl: string; extraImages: ExtraImage[]; extraMd: string;
  statsProvider: StatsProvider; statsTheme: string; palette: Palette;
  sections: Sections; selectedTech: string[]; customTech: TechItem[];
};
export type GitHubUser = {
  login: string; name: string | null; bio: string | null; blog: string | null;
  twitter_username: string | null; avatar_url: string; public_repos: number;
  public_gists: number; followers: number; following: number; html_url: string;
  location: string | null; company: string | null; created_at: string; updated_at: string;
};
export type GitHubRepo = {
  name: string; html_url: string; description: string | null;
  stargazers_count: number; forks_count: number; language: string | null;
  fork: boolean; updated_at: string;
};
