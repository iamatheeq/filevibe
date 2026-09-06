import type { GeneratorConfig, Palette, Sections } from "./types";

export const DEFAULT_PALETTE: Palette = {
  badgeBg: "#1C1C1E",
  logoColor: "#F5A31A",
  bannerColor: "0:0B4F8C,100:F5A31A",
  bannerText: "#FFFFFF",
  typingColor: "#F5A31A",
  visitorColor: "#0B4F8C",
};

export const COLOR_PRESETS: { name: string; palette: Palette }[] = [
  {
    name: "MD Craft",
    palette: {
      badgeBg: "#1C1C1E",
      logoColor: "#E6007A",
      bannerColor: "0:7C3AED,100:E6007A",
      bannerText: "#FFFFFF",
      typingColor: "#E6007A",
      visitorColor: "#7C3AED",
    },
  },
  {
    name: "Apple Blue",
    palette: {
      badgeBg: "#1C1C1E",
      logoColor: "#0A84FF",
      bannerColor: "0:0A0A0C,100:1C1C1E",
      bannerText: "#F5F5F7",
      typingColor: "#0A84FF",
      visitorColor: "#0A84FF",
    },
  },
  {
    name: "Teal Night",
    palette: {
      badgeBg: "#10201B",
      logoColor: "#4FA69A",
      bannerColor: "0:10201B,100:1B3A36",
      bannerText: "#4FA69A",
      typingColor: "#4FA69A",
      visitorColor: "#4FA69A",
    },
  },
  {
    name: "Sunset",
    palette: {
      badgeBg: "#3A1420",
      logoColor: "#FF9F0A",
      bannerColor: "0:3A1420,100:C1502E",
      bannerText: "#F5F5F7",
      typingColor: "#FF9F0A",
      visitorColor: "#FF453A",
    },
  },
];

export const DEFAULT_SECTIONS: Sections = {
  avatar: true,
  banner: true,
  typing: true,
  about: true,
  contact: true,
  analytics: false,
  stats: false,
  langs: false,
  streak: false,
  snake: false,
  repos: false,
  activity: false,
  visitors: true,
  updated: true,
  extraMd: true,
};

const COMPANY_EXTRA_MD = `## 🚀 What we build

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Inter&weight=600&size=18&duration=3000&pause=800&color=E6007A&center=true&vCenter=true&width=640&lines=Enterprise+SaaS+Platform;Cloud+Native+%C2%B7+API+First+%C2%B7+AI+Ready;Build.+Scale.+Automate." alt="Mugavai typing" />
</p>

**Mugavai.co** is an enterprise software and B2B SaaS company. We help organizations automate business processes, improve productivity, and ship enterprise-grade digital solutions from a single platform.

| Capability | Focus |
| --- | --- |
| ☁️ **Cloud Native** | Scalable cloud applications built for growth |
| 🔒 **Enterprise Security** | Security-first architecture for business data |
| 🔌 **API First** | Integrations that plug into your stack |
| 🤖 **AI Ready** | Automation and intelligence where it matters |
| 📐 **Scalable Architecture** | Platforms designed to scale with your ops |

## 📊 At a glance

| | | | |
| :---: | :---: | :---: | :---: |
| **10+** Customers | **4+** Products | **99.9%** Uptime | **24/7** Support |

## 🧭 Explore Mugavai

- 🏠 [Home](https://www.mugavai.co/) — Build. Scale. Automate.
- ℹ️ [About](https://www.mugavai.co/about) — Mission, story, and products
- 📦 [Products](https://www.mugavai.co/products) — Enterprise SaaS platform
- 💼 [Careers](https://www.mugavai.co/careers) — Join the growing team
- 🎓 [Internship](https://www.mugavai.co/internship) — Kick-start your career
- ✉️ [Contact](https://www.mugavai.co/contact) — Book a demo or talk to us

<p align="center">
  <a href="https://www.mugavai.co/products"><img src="https://img.shields.io/badge/Explore_Products-7C3AED?style=for-the-badge" alt="Explore Products" /></a>
  <a href="https://www.mugavai.co/careers"><img src="https://img.shields.io/badge/Join_Us-E6007A?style=for-the-badge" alt="Join Us" /></a>
  <a href="https://www.mugavai.co/contact"><img src="https://img.shields.io/badge/Book_Demo-1C1C1E?style=for-the-badge" alt="Book Demo" /></a>
</p>

## 🌐 Connect with Mugavai

[![Website](https://img.shields.io/badge/mugavai.co-E6007A?style=for-the-badge&logo=googlechrome&logoColor=white)](https://www.mugavai.co/)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/company/mugavaico)
[![X](https://img.shields.io/badge/X-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/mugavaico)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/mugavaico)
[![Instagram](https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://www.instagram.com/mugavai.co/)
`;

export const DEFAULT_CONFIG: GeneratorConfig = {
  username: "",
  tagline: "",
  about: "",
  focus: "",
  website: "",
  email: "",
  mobile: "",
  linkedin: "",
  location: "",
  resume: "",
  bannerText: "",
  bannerStyle: "waving",
  typingLines: "",
  avatarMode: "github",
  customAvatarUrl: "",
  customBannerUrl: "",
  extraImages: [],
  extraMd: "",
  statsProvider: "extended",
  statsTheme: "radical",
  palette: { ...DEFAULT_PALETTE },
  sections: { ...DEFAULT_SECTIONS },
  selectedTech: [],
  customTech: [],
};

export const DEVELOPER = {
  name: "Atheeq Urrahman",
  handle: "iamatheeq",
  github: "https://github.com/iamatheeq",
  linkedin: "https://www.linkedin.com/in/iamatheeq/",
  instagram: "https://www.instagram.com/iamatheeq/",
  avatar: "https://github.com/iamatheeq.png",
};

export const COMPANY = {
  name: "Mugavai.co",
  legalName: "Mugavai.co Technologies",
  website: "https://www.mugavai.co/",
  github: "https://github.com/mugavaico",
  linkedin: "https://www.linkedin.com/company/mugavaico",
  x: "https://x.com/mugavaico",
  instagram: "https://www.instagram.com/mugavai.co/",
  tagline: "Enterprise Software & B2B SaaS Solutions",
};
