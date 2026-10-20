import { notFound } from "next/navigation";
import { listRecords, q, TABLES } from "@/lib/airtable";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { PacketForm } from "@/components/PacketForm";

export const dynamic = "force-dynamic";

export default async function PacketPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const recs = await listRecords<Record<string, string>>(TABLES.applications, {
    filterByFormula: `{Resume Token} = ${q(token)}`,
    maxRecords: 1,
  });
  const rec = recs[0];
  if (!rec || !["Finalist", "Interviewed", "Selected"].includes(rec.fields["Status"])) notFound();

  return (
    <>
      <SiteHeader nav={false} />
      <main className="narrow" style={{ padding: "48px 24px 80px", display: "flex", flexDirection: "column", gap: 28 }}>
        <div className="section-head">
          <div className="eyebrow">Finalist materials</div>
          <h1 style={{ fontSize: 36, fontWeight: 800 }}>{rec.fields["Company"]}</h1>
          <p className="body">
            Ahead of your interview with the selection committee, please share links to the three documents below. Google Drive, Dropbox, DocSend, or similar links are fine; please make sure they are viewable by anyone with the link.
          </p>
        </div>
        <PacketForm
          token={token}
          initial={{
            deck: rec.fields["Packet Deck"] || rec.fields["Deck URL"] || "",
            financials: rec.fields["Packet Financials"] || "",
            capTable: rec.fields["Packet Cap Table"] || "",
            notes: rec.fields["Packet Notes"] || "",
          }}
          submittedAt={rec.fields["Packet Submitted At"]}
        />
      </main>
      <SiteFooter />
    </>
  );
}
