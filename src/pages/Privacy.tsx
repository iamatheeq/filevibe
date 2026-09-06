import { processingDetail } from "../lib/privacy";
import { Button } from "../components/ui/Button";
import { toast } from "../lib/toast";

export default function Privacy() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4 sm:p-6">
      <h2 className="text-[18px] font-semibold">Privacy & Security</h2>
      <p className="text-[13px] text-[var(--color-text-muted)]">
        Your files are yours. FileVibe is designed to process files locally in your browser whenever possible.
      </p>
      <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-[13px]">
        <h3 className="font-semibold">Local processing</h3>
        <p className="mt-1 text-[var(--color-text-muted)]">{processingDetail("local")}</p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-[var(--color-text-muted)]">
          <li>No automatic upload of your files</li>
          <li>No automatic cloud storage of uploads</li>
          <li>Uploaded code is never executed</li>
          <li>Markdown/HTML previews are sanitized or sandboxed</li>
          <li>Object URLs are revoked when files are cleared</li>
        </ul>
      </section>
      <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-[13px]">
        <h3 className="font-semibold">What we do not log</h3>
        <p className="mt-1 text-[var(--color-text-muted)]">
          File contents, document text, source code, passwords, and tokens are not written to application logs.
        </p>
      </section>
      <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-[13px]">
        <h3 className="font-semibold">Local data</h3>
        <p className="mt-1 text-[var(--color-text-muted)]">
          Theme and sidebar preferences may be stored in localStorage on this device only.
        </p>
        <Button
          size="sm"
          variant="outline"
          className="mt-3"
          onClick={() => {
            localStorage.removeItem("pc-theme");
            localStorage.removeItem("mdc-sidebar-collapsed");
            toast("success", "Local preferences cleared on this device.");
          }}
        >
          Clear local preferences
        </Button>
      </section>
      <p className="text-[12px] text-[var(--color-text-muted)]">
        Powered by Mugavai.co · Privacy Policy language must match real behavior. Server processing is labeled when required.
      </p>
    </div>
  );
}
