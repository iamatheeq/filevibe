/** Visual Markdown Generator — block model → clean Markdown. */

export type BlockType =
  | "heading"
  | "paragraph"
  | "bold"
  | "italic"
  | "link"
  | "image"
  | "code"
  | "codeblock"
  | "quote"
  | "table"
  | "ul"
  | "ol"
  | "task"
  | "divider"
  | "badge"
  | "custom";

export type MdBlock = {
  id: string;
  type: BlockType;
  // Shared flexible fields
  text?: string;
  level?: 1 | 2 | 3 | 4;
  href?: string;
  alt?: string;
  lang?: string;
  rows?: string[][]; // tables
  items?: string[]; // lists / tasks
  checked?: boolean[]; // task list
  badgeLabel?: string;
  badgeColor?: string;
};

export function newBlock(type: BlockType): MdBlock {
  const id = crypto.randomUUID();
  switch (type) {
    case "heading":
      return { id, type, text: "Heading", level: 2 };
    case "paragraph":
      return { id, type, text: "Paragraph text." };
    case "bold":
      return { id, type, text: "Bold text" };
    case "italic":
      return { id, type, text: "Italic text" };
    case "link":
      return { id, type, text: "Link label", href: "https://example.com" };
    case "image":
      return { id, type, alt: "Image", href: "https://via.placeholder.com/640x200" };
    case "code":
      return { id, type, text: "code" };
    case "codeblock":
      return { id, type, text: "console.log('hello');", lang: "js" };
    case "quote":
      return { id, type, text: "Quoted insight." };
    case "table":
      return {
        id,
        type,
        rows: [
          ["Column A", "Column B"],
          ["Value 1", "Value 2"],
        ],
      };
    case "ul":
      return { id, type, items: ["First item", "Second item"] };
    case "ol":
      return { id, type, items: ["Step one", "Step two"] };
    case "task":
      return { id, type, items: ["Todo item", "Done item"], checked: [false, true] };
    case "divider":
      return { id, type };
    case "badge":
      return { id, type, badgeLabel: "Badge", badgeColor: "0B4F8C", href: "https://example.com" };
    case "custom":
      return { id, type, text: "<!-- custom markdown -->\n" };
    default:
      return { id, type: "paragraph", text: "" };
  }
}

export function blocksToMarkdown(blocks: MdBlock[]): string {
  const out: string[] = [];
  for (const b of blocks) {
    switch (b.type) {
      case "heading": {
        const n = Math.min(4, Math.max(1, b.level || 2));
        out.push(`${"#".repeat(n)} ${(b.text || "").trim()}\n`);
        break;
      }
      case "paragraph":
        out.push(`${(b.text || "").trim()}\n`);
        break;
      case "bold":
        out.push(`**${(b.text || "").trim()}**\n`);
        break;
      case "italic":
        out.push(`*${(b.text || "").trim()}*\n`);
        break;
      case "link":
        out.push(`[${(b.text || "link").trim()}](${(b.href || "#").trim()})\n`);
        break;
      case "image":
        out.push(`![${(b.alt || "image").trim()}](${(b.href || "").trim()})\n`);
        break;
      case "code":
        out.push(`\`${(b.text || "").trim()}\`\n`);
        break;
      case "codeblock":
        out.push(`\`\`\`${b.lang || ""}\n${b.text || ""}\n\`\`\`\n`);
        break;
      case "quote":
        out.push(
          (b.text || "")
            .split("\n")
            .map((l) => `> ${l}`)
            .join("\n") + "\n",
        );
        break;
      case "table": {
        const rows = b.rows || [["A", "B"]];
        const header = rows[0] || ["Col"];
        const body = rows.slice(1);
        out.push(`| ${header.join(" | ")} |`);
        out.push(`| ${header.map(() => "---").join(" | ")} |`);
        for (const r of body) out.push(`| ${r.join(" | ")} |`);
        out.push("");
        break;
      }
      case "ul":
        for (const item of b.items || []) out.push(`- ${item}`);
        out.push("");
        break;
      case "ol":
        (b.items || []).forEach((item, i) => out.push(`${i + 1}. ${item}`));
        out.push("");
        break;
      case "task":
        (b.items || []).forEach((item, i) => {
          const checked = b.checked?.[i] ? "x" : " ";
          out.push(`- [${checked}] ${item}`);
        });
        out.push("");
        break;
      case "divider":
        out.push("---\n");
        break;
      case "badge": {
        const label = encodeURIComponent(b.badgeLabel || "Badge");
        const color = (b.badgeColor || "0B4F8C").replace(/^#/, "");
        const href = b.href || "#";
        out.push(`[![${b.badgeLabel || "Badge"}](https://img.shields.io/badge/${label}-${color}?style=for-the-badge)](${href})\n`);
        break;
      }
      case "custom":
        out.push(`${b.text || ""}\n`);
        break;
    }
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}
