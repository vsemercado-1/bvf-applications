import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { ShareLink } from "@/components/ShareLink";
import { siteUrl } from "@/lib/email";

export default async function NotEligible({ searchParams }: { searchParams: Promise<{ reason?: string }> }) {
  const { reason } = await searchParams;
  const isRegion = reason === "region";
  return (
    <>
      <SiteHeader nav={false} />
      <main className="narrow" style={{ padding: "80px 24px 120px", display: "flex", flexDirection: "column", gap: 24 }}>
        <div className="eyebrow">Eligibility</div>
        <h1 style={{ fontSize: 36, fontWeight: 800 }}>
          {isRegion ? "The Fellowship is limited to four regions this year." : "The Fellowship is for founders of Puerto Rican descent."}
        </h1>
        <p className="body" style={{ fontSize: 17, lineHeight: 1.6 }}>
          {isRegion
            ? "The 2027 cohort is open to founders living in Puerto Rico, New York City, Miami, or the San Francisco Bay Area. We hope to expand further in future years."
            : "The Fellowship was created to support Puerto Rican entrepreneurs specifically, and that requirement applies to every cohort."}{" "}
          Thank you for your interest in the program.
        </p>
        <div className="box" style={{ marginTop: 8 }}>
          <h3>Know a founder who should apply?</h3>
          <p className="body small">If someone comes to mind who would be a fit, send them this page.</p>
          <div><ShareLink url={siteUrl("/")} className="btn btn-ink btn-sm" /></div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
