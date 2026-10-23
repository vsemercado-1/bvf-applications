import { redirect } from "next/navigation";
import { listRecords, q, TABLES } from "@/lib/airtable";
import { ALL_FIELDS } from "@/lib/schema";
import { getSettings } from "@/lib/settings";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { ApplicationForm } from "@/components/ApplicationForm";

export const dynamic = "force-dynamic";

export default async function ResumePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!(await getSettings()).accepting) redirect("/#apply");
  const recs = await listRecords<Record<string, string | unknown>>(TABLES.applications, {
    filterByFormula: `{Resume Token} = ${q(token)}`,
    maxRecords: 1,
  });
  const rec = recs[0];
  if (!rec) redirect("/#apply");
  if (String(rec.fields["Status"]) === "Submitted") redirect("/apply/thanks");

  const values: Record<string, string> = {};
  for (const f of ALL_FIELDS) {
    const v = rec.fields[f.key];
    if (typeof v === "string") values[f.key] = v;
    else if (typeof v === "number") values[f.key] = String(v);
  }
  const shot = (rec.fields as Record<string, unknown>)["Headshot"];
  if (Array.isArray(shot) && shot[0] && typeof shot[0] === "object" && "url" in shot[0]) values["Headshot"] = String((shot[0] as { url: string }).url);

  return (
    <>
      <SiteHeader nav={false} />
      <main className="narrow" style={{ padding: "48px 24px 80px", display: "flex", flexDirection: "column", gap: 28 }}>
        <div className="eyebrow">Welcome back · your draft is restored · saves as you go</div>
        <ApplicationForm region={String(rec.fields["Region"] || "")} token={token} initial={values} />
      </main>
      <SiteFooter />
    </>
  );
}
