import {
  HiOutlineUserCircle,
  HiOutlineFolderOpen,
  HiOutlineDocument,
  HiOutlineDocumentText,
  HiOutlinePhoto,
  HiOutlineSwatch,
  HiOutlineArrowsRightLeft,
  HiOutlineSparkles,
  HiOutlineArrowRight,
} from "react-icons/hi2";
import { useHashRoute, type AppRoute } from "../lib/router";
import { Button } from "../components/ui/Button";

const CARDS: { to: AppRoute; title: string; desc: string; cta: string; icon: typeof HiOutlineFolderOpen }[] = [
  { to: "/readme", title: "GitHub Reader", desc: "Profile data and polished README generation.", cta: "Open", icon: HiOutlineUserCircle },
  { to: "/reader", title: "File Reader", desc: "Detect any file and view when supported.", cta: "Read file", icon: HiOutlineFolderOpen },
  { to: "/pdf", title: "PDF Editor", desc: "Open, zoom, and download PDFs locally.", cta: "Edit PDF", icon: HiOutlineDocument },
    { to: "/images", title: "Image Tool", desc: "Resize and compress to a target size.", cta: "Process", icon: HiOutlinePhoto },
  { to: "/colors", title: "Color Studio", desc: "Picker, values, palettes, gradients.", cta: "Open", icon: HiOutlineSwatch },
  { to: "/converter", title: "File Converter", desc: "Capability-based conversions only.", cta: "Convert", icon: HiOutlineArrowsRightLeft },
  { to: "/generator", title: "Markdown Generator", desc: "Build Markdown with visual blocks.", cta: "Generate", icon: HiOutlineSparkles },
];

export default function Dashboard() {
  const [, navigate] = useHashRoute();
  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Welcome</p>
        <h2 className="mt-1 text-[24px] font-semibold tracking-[-0.03em]">FileVibe</h2>
        <p className="mt-2 max-w-xl text-[14px] text-[var(--color-text-muted)]">
          Transform Anything. Create Everything. Privacy-first tools that process on your device whenever possible.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.to}
              type="button"
              onClick={() => navigate(card.to)}
              className="group rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-left transition hover:border-[var(--color-primary)]/50 hover:shadow-lg"
            >
              <div
                className="mb-3 flex size-10 items-center justify-center rounded-[var(--radius-md)] text-white"
                style={{ background: "linear-gradient(135deg, #800020 0%, #D2143A 100%)" }}
              >
                <Icon className="size-5" />
              </div>
              <h3 className="text-[15px] font-semibold">{card.title}</h3>
              <p className="mt-1.5 text-[13px] text-[var(--color-text-muted)]">{card.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-primary-hover)]">
                {card.cta} <HiOutlineArrowRight className="size-4 transition group-hover:translate-x-0.5" />
              </span>
            </button>
          );
        })}
      </div>
      <section className="mt-8 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h3 className="text-[13px] font-semibold">Quick actions</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" onClick={() => navigate("/reader")}>Read File</Button>
          <Button size="sm" variant="secondary" onClick={() => navigate("/converter")}>Convert File</Button>
          <Button size="sm" variant="outline" onClick={() => navigate("/pdf")}>Open PDF</Button>
          <Button size="sm" variant="outline" onClick={() => navigate("/images")}>Compress Image</Button>
        </div>
      </section>
    </div>
  );
}
