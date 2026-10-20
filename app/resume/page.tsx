import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { ResumeForm } from "@/components/ResumeForm";

export default function ResumeLanding() {
  return (
    <>
      <SiteHeader nav={false} />
      <main className="narrow" style={{ padding: "80px 24px 120px", display: "flex", flexDirection: "column", gap: 24 }}>
        <div className="eyebrow">Resume your application</div>
        <h1 style={{ fontSize: 36, fontWeight: 800 }}>Pick up where you left off.</h1>
        <p className="body" style={{ fontSize: 17, lineHeight: 1.6 }}>
          If you&apos;re on the same browser you started in, just <a href="/#apply">go back to the application</a> and your answers will be there. From another device, enter the email you used and we&apos;ll send you your private link.
        </p>
        <ResumeForm />
      </main>
      <SiteFooter />
    </>
  );
}
