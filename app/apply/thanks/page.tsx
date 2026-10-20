import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";

export default async function ThanksPage({ searchParams }: { searchParams: Promise<{ first?: string; company?: string }> }) {
  const { first, company } = await searchParams;
  return (
    <>
      <SiteHeader nav={false} />
      <main className="narrow" style={{ padding: "80px 24px 120px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div className="eyebrow">Application received</div>
        <h1 style={{ fontSize: 40, fontWeight: 800 }}>{first ? `Thank you, ${first}.` : "Thank you for applying."}</h1>
        <p className="body" style={{ fontSize: 17, lineHeight: 1.6 }}>
          {company ? `Your application for ${company} has been submitted` : "Your application has been submitted"} to the Bravo Venture Fellowship. Applications are reviewed on a rolling basis, and the Foundation will be in touch by email. Finalists are invited to an interview with the selection committee in late January.
        </p>
        <p className="body">
          If you know another founder who should apply, you can <Link href="/#nominate">nominate them here</Link>.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
