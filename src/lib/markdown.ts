import { safeHttpUrl, stripHash, yearsSince, formatDate } from "./utils";
import { CATALOG, slugify } from "./tech";
import { githubAvatarUrl } from "./github";
import type { GeneratorConfig, GitHubRepo, GitHubUser, TechItem } from "./types";

function shieldLabel(value: string) {
  return encodeURIComponent(value.replace(/-/g, "--").replace(/_/g, "__"));
}

function badge(label: string, slug: string, bg: string, logo: string) {
  const encoded = encodeURIComponent(label);
  return `![${label}](https://img.shields.io/badge/${encoded}-${stripHash(bg)}?style=for-the-badge&logo=${slug}&logoColor=${stripHash(logo)})`;
}

function resolveTech(config: GeneratorConfig): TechItem[] {
  const catalogByLabel = new Map(CATALOG.map((t) => [t.label, t]));
  const customByLabel = new Map(config.customTech.map((t) => [t.label, t]));
  return config.selectedTech
    .map((label) => customByLabel.get(label) ?? catalogByLabel.get(label))
    .filter((t): t is TechItem => Boolean(t));
}

function languageBreakdown(repos: GitHubRepo[]) {
  const counts = new Map<string, number>();
  for (const r of repos) {
    if (!r.language) continue;
    counts.set(r.language, (counts.get(r.language) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

export function buildMarkdown(user: GitHubUser, repos: GitHubRepo[], config: GeneratorConfig): string {
  const uname = config.username.trim() || user.login;
  const name = user.name || uname;
  const { sections, palette } = config;
  const parts: string[] = [];
  const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0);
  const totalForks = repos.reduce((s, r) => s + (r.forks_count || 0), 0);
  const tenure = yearsSince(user.created_at || new Date().toISOString());
  const langs = languageBreakdown(repos);

  // Hero: optional custom banner + circular avatar + centered name
  {
    const avatarSrc =
      config.avatarMode === "custom"
        ? safeHttpUrl(config.customAvatarUrl)
        : config.avatarMode === "github"
          ? githubAvatarUrl(uname)
          : null;
    // Only render banner when user provides a real image URL (GitHub/raw preferred).
    const customBanner = safeHttpUrl(config.customBannerUrl);
    const showBanner = sections.banner && Boolean(customBanner);

    const hero: string[] = ['<div align="center">'];
    if (showBanner && customBanner) {
      hero.push(`  <img src="${customBanner}" width="100%" alt="${name} banner" />`);
    }
    if (sections.avatar && avatarSrc) {
      const overlap = showBanner
        ? "border-radius:50%; border:4px solid #ffffff; margin-top:-72px; box-shadow:0 4px 16px rgba(0,0,0,0.25);"
        : "border-radius:50%; border:3px solid #0A84FF;";
      hero.push(
        `  <img src="${avatarSrc}" width="140" height="140" alt="${name}" style="${overlap}" />`,
      );
    }
    hero.push(`  <h1 style="margin-top:12px; margin-bottom:4px;">${name}</h1>`);
    hero.push("</div>\n");
    if (showBanner || (sections.avatar && avatarSrc)) {
      parts.push(hero.join("\n"));
    } else {
      parts.push(`# ${name}\n`);
    }
  }

  if (sections.typing) {
    const lines = config.typingLines.split(";").map((s) => s.trim()).filter(Boolean);
    if (lines.length) {
      const linesParam = lines.map((l) => encodeURIComponent(l)).join(";");
      parts.push(
        `<p align="center">\n  <a href="https://git.io/typing-svg">\n    <img src="https://readme-typing-svg.demolab.com?font=Inter&weight=500&size=22&duration=3200&pause=900&color=${stripHash(palette.typingColor)}&center=true&vCenter=true&width=640&lines=${linesParam}" alt="Typing headline" />\n  </a>\n</p>\n`,
      );
    }
  } else if (config.tagline.trim()) {
    parts.push(`> ${config.tagline.trim()}\n`);
  }

  if (sections.about) {
    parts.push(`### 💡 About Me\n`);
    const about = config.about.trim() || user.bio || "";
    if (about) parts.push(`${about}\n`);
    const bullets: string[] = [];
    if (config.focus.trim()) bullets.push(`- 🎯 **Currently focused on:** ${config.focus.trim()}`);
    if (user.company) bullets.push(`- 🏢 **Company / org:** ${user.company}`);
    if (user.location || config.location.trim()) {
      bullets.push(`- 📍 **Location:** ${config.location.trim() || user.location}`);
    }
    if (user.created_at) {
      bullets.push(`- 📅 **On GitHub since:** ${formatDate(user.created_at)} (${tenure}+ year${tenure === 1 ? "" : "s"})`);
    }
    if (config.website.trim() || user.blog) {
      const site = config.website.trim() || user.blog;
      bullets.push(`- 🌐 **Portfolio / web:** [${site}](${site})`);
    }
    if (config.email.trim()) bullets.push(`- 📧 **Email:** ${config.email.trim()}`);
    if (config.resume.trim()) bullets.push(`- 📝 **Resume:** [View](${config.resume.trim()})`);
    if (bullets.length) parts.push(bullets.join("\n") + "\n");
  }

  if (sections.analytics) {
    parts.push(`## Profile Analytics\n`);
    parts.push(`| Metric | Value |`);
    parts.push(`| --- | ---: |`);
    parts.push(`| Public repositories | ${user.public_repos} |`);
    parts.push(`| Followers | ${user.followers} |`);
    parts.push(`| Following | ${user.following} |`);
    parts.push(`| Stars on featured repos | ${totalStars} |`);
    parts.push(`| Forks on featured repos | ${totalForks} |`);
    parts.push(`| Public gists | ${user.public_gists ?? 0} |`);
    parts.push(`| Account tenure | ${tenure}+ years |`);
    if (langs.length) {
      parts.push(`| Top languages (featured) | ${langs.slice(0, 4).map(([l, n]) => `${l} (${n})`).join(", ")} |`);
    }
    parts.push("");
  }

  // Extra images — portfolio / project screenshots shown under about
  const extraImgs = config.extraImages.filter((img) => safeHttpUrl(img.url));
  if (extraImgs.length) {
    parts.push(`## Gallery\n`);
    parts.push(
      extraImgs
        .map((img) => {
          const src = safeHttpUrl(img.url)!;
          const alt = img.alt.trim() || "Project screenshot";
          return `<p align="center"><img src="${src}" alt="${alt}" width="80%" /><br/><sub>${alt}</sub></p>`;
        })
        .join("\n") + "\n",
    );
  }

  if (sections.contact) {
    const email = config.email.trim();
    const mobile = config.mobile.trim();
    const linkedinRaw = config.linkedin.trim();
    const location = config.location.trim();
    const resume = safeHttpUrl(config.resume);
    const website = safeHttpUrl(config.website);

    let linkedinUrl = "";
    let linkedinHandle = "";
    if (linkedinRaw) {
      if (/^https?:\/\//i.test(linkedinRaw)) {
        linkedinUrl = linkedinRaw.replace(/\/$/, "");
        const m = linkedinUrl.match(/linkedin\.com\/(in|company)\/([^/?#]+)/i);
        linkedinHandle = m ? m[2] : linkedinUrl;
      } else if (linkedinRaw.toLowerCase().startsWith("company/")) {
        linkedinHandle = linkedinRaw.slice(8);
        linkedinUrl = `https://www.linkedin.com/company/${linkedinHandle}`;
      } else {
        linkedinHandle = linkedinRaw.replace(/^@/, "").replace(/\/$/, "");
        linkedinUrl = `https://www.linkedin.com/in/${linkedinHandle}`;
      }
    }
    const waDigits = mobile ? mobile.replace(/[^\d+]/g, "").replace("+", "") : "";

    const rows: string[] = [];
    if (email) rows.push(`| **Email** | [${email}](mailto:${email}) |`);
    if (mobile) {
      const wa = waDigits ? ` · [Chat on WhatsApp](https://wa.me/${waDigits})` : "";
      rows.push(`| **Phone / WhatsApp** | ${mobile}${wa} |`);
    }
    if (linkedinUrl) rows.push(`| **LinkedIn** | [@${linkedinHandle}](${linkedinUrl}) |`);
    if (website) rows.push(`| **Website** | [${website.replace(/^https?:\/\//, "")}](${website}) |`);
    if (resume) rows.push(`| **Resume / CV** | [View resume](${resume}) |`);
    if (location) rows.push(`| **Location** | ${location} |`);
    rows.push(`| **GitHub** | [@${uname}](${user.html_url}) |`);

    if (rows.length) {
      parts.push(`## Contact & links\n`);
      parts.push(`| Channel | Details |`);
      parts.push(`| --- | --- |`);
      parts.push(rows.join("\n") + "\n");

      const badges: string[] = [];
      if (email) {
        badges.push(
          `[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:${email})`,
        );
      }
      if (waDigits) {
        badges.push(
          `[![WhatsApp](https://img.shields.io/badge/WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://wa.me/${waDigits})`,
        );
      }
      if (linkedinUrl) {
        badges.push(
          `[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](${linkedinUrl})`,
        );
      }
      badges.push(
        `[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](${user.html_url})`,
      );
      if (website) {
        badges.push(
          `[![Website](https://img.shields.io/badge/Website-${stripHash(palette.badgeBg)}?style=for-the-badge&logo=googlechrome&logoColor=${stripHash(palette.logoColor)})](${website})`,
        );
      }
      if (resume) {
        badges.push(
          `[![Resume](https://img.shields.io/badge/Resume-${stripHash(palette.badgeBg)}?style=for-the-badge&logo=readdotcv&logoColor=${stripHash(palette.logoColor)})](${resume})`,
        );
      }
      parts.push(`${badges.join(" ")}\n`);
    }
  }

  const tech = resolveTech(config);
  if (tech.length) {
    const row = tech
      .map((t) => badge(t.label, t.slug || slugify(t.label), palette.badgeBg, palette.logoColor))
      .join(" ");
    parts.push(`### 🛠️ Tech Stack\n\n${row}\n`);
  }

  if (sections.stats || sections.langs || sections.streak) {
    parts.push(`### 📊 GitHub Insights\n`);
    const provider = config.statsProvider;
    const theme = config.statsTheme || "transparent";
    const base =
      provider === "official" || provider === "extended"
        ? "https://github-readme-stats.vercel.app"
        : null;
    // GitHub-friendly centered row (table) — avoids huge disconnected blocks
    const cells: string[] = [];
    if (provider === "action") {
      if (sections.stats) cells.push(`![Stats](./profile/stats.svg)`);
      if (sections.langs) cells.push(`![Top Langs](./profile/top-langs.svg)`);
    } else if (base) {
      if (sections.stats) {
        cells.push(
          `![Stats](${base}/api?username=${uname}&show_icons=true&theme=${theme}&hide_border=true&include_all_commits=true&bg_color=00000000&card_width=380)`,
        );
      }
      if (sections.langs) {
        cells.push(
          `![Top Langs](${base}/api/top-langs/?username=${uname}&layout=compact&theme=${theme}&hide_border=true&bg_color=00000000&card_width=320)`,
        );
      }
    }
    if (sections.streak) {
      cells.push(
        `![Streak](https://streak-stats.demolab.com?user=${uname}&theme=${theme}&hide_border=true&background=00000000)`,
      );
    }
    if (cells.length === 1) {
      parts.push(`<p align="center">\n  ${cells[0]}\n</p>\n`);
    } else if (cells.length > 1) {
      parts.push(`<div align="center">\n`);
      parts.push(`\n| ${cells.map(() => " ").join(" | ")} |`);
      parts.push(`| ${cells.map(() => ":---:").join(" | ")} |`);
      parts.push(`| ${cells.join(" | ")} |\n`);
      parts.push(`</div>\n`);
    }
  }

  if (sections.activity) {
    parts.push(`## Contribution Activity\n`);
    parts.push(
      `![Activity graph](https://github-readme-activity-graph.vercel.app/graph?username=${uname}&theme=react-dark&hide_border=true&area=true)\n`,
    );
  }

  if (sections.repos) {
    parts.push(`### 🚀 Featured Work${repos.length ? ` · ★ ${totalStars}` : ""}\n`);
    if (repos.length) {
      for (const r of repos) {
        const desc = (r.description || "No description").replace(/\n/g, " ");
        const lang = r.language ? r.language : "—";
        parts.push(
          `### [${r.name}](${r.html_url})\n\n` +
            `${desc}\n\n` +
            `⭐ **${r.stargazers_count}** · 🍴 **${r.forks_count || 0}** · \`${lang}\`\n`,
        );
      }
    } else {
      parts.push(`_No public repositories found for this account._\n`);
    }
  }

  if (sections.snake) {
    parts.push(`## Contribution Snake\n`);
    parts.push(
      `![snake dark](https://raw.githubusercontent.com/${uname}/${uname}/output/github-contribution-grid-snake-dark.svg#gh-dark-mode-only)\n`,
    );
    parts.push(
      `![snake light](https://raw.githubusercontent.com/${uname}/${uname}/output/github-contribution-grid-snake.svg#gh-light-mode-only)\n`,
    );
  }

  if (sections.extraMd && config.extraMd.trim()) {
    parts.push(`${config.extraMd.trim()}\n`);
  }

  if (sections.visitors) {
    parts.push(
      `---\n\n![Profile views](https://komarev.com/ghpvc/?username=${uname}&color=${stripHash(palette.visitorColor)}&style=for-the-badge)\n`,
    );
  }

  if (sections.updated) {
    const today = new Date().toISOString().slice(0, 10);
    parts.push(`\n<sub>Virtual resume last generated: ${today} · FileVibe</sub>\n`);
  }

  return parts.join("\n");
}
