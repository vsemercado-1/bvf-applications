import { redirect } from "next/navigation";
import { listRecords, q, TABLES } from "@/lib/airtable";
import { ALL_FIELDS } from "@/lib/schema";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { ApplicationForm } from "@/components/ApplicationForm";

export const dynamic = "force-dynamic";

export default async function ResumePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const recs = await listRecords<Record<string, string>>(TABLES.applications, {
    filterByFormula: `{Resume Token} = ${q(token)}`,
    maxRecords: 1,
  });
  const rec = recs[0];
  if (!rec) redirect("/#apply");
  if (rec.fields["Status"] === "Submitted") redirect("/apply/thanks");

  const values: Record<string, string> = {};
  for (const f of ALL_FIELDS) {
    const v = rec.fields[f.key];
    if (typeof v === "string") values[f.key] = v;
  }

  return (
    <>
      <SiteHeader nav={false} />
      <main className="narrow" style={{ padding: "48px 24px 80px", display: "flex", flexDirection: "column", gap: 28 }}>
        <div className="section-head">
          <div className="eyebrow">2027 Cohort</div>
          <h1 style={{ fontSize: 36, fontWeight: 800 }}>Welcome back</h1>
          <p className="body">Your draft has been restored. Your answers continue to save automatically.</p>
        </div>
        <ApplicationForm region={rec.fields["Region"]} token={token} initial={values} />
      </main>
      <SiteFooter />
    </>
  );
}
