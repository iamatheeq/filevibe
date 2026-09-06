import type { GitHubRepo, GitHubUser } from "./types";

export function githubAvatarUrl(username: string) {
  return `https://github.com/${encodeURIComponent(username)}.png`;
}

export async function fetchUser(username: string): Promise<GitHubUser> {
  const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`);
  if (res.status === 404) throw new Error("NOT_FOUND");
  if (!res.ok) throw new Error(`API_${res.status}`);
  return res.json();
}

export async function fetchTopRepos(username: string): Promise<{ repos: GitHubRepo[]; failed: boolean }> {
  try {
    const res = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&direction=desc&per_page=100`,
    );
    if (!res.ok) return { repos: [], failed: true };
    const all = (await res.json()) as GitHubRepo[];
    const repos = all
      .filter((r) => !r.fork)
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 6);
    return { repos, failed: false };
  } catch {
    return { repos: [], failed: true };
  }
}
