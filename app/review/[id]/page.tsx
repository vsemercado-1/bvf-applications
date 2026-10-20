import Link from "next/link";
import { notFound } from "next/navigation";
import { getApplication, listReviewsFor } from "@/lib/review-data";
import { currentReviewer } from "@/lib/session";
import { publicReviewers } from "@/lib/auth";
import { siteUrl } from "@/lib/email";
import { ApplicationView } from "@/components/review/ApplicationView";
import { Scorecard } from "@/components/review/Scorecard";
import { OtherReviews } from "@/components/review/OtherReviews";
import { StatusControl } from "@/components/review/StatusControl";
import { StatusPill } from "@/components/review/StatusPill";
import { Avatar } from "@/components/Avatar";
import { headshotUrl } from "@/lib/review-data";

export const dynamic = "force-dynamic";

export default async function ApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const me = await currentReviewer();
  let app;
  try {
    app = await getApplication(id);
  } catch {
    notFound();
  }
  const reviews = await listReviewsFor(id);
  const f = app.fields;
  const mine = reviews.find((r) => r.stage === "Screen" && r.reviewer === me?.email);
  const finalist = ["Finalist", "Interviewed", "Selected"].includes(f["Status"] || "");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <Link href="/review" className="small muted" style={{ textDecoration: "none" }}>← Applications</Link>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginTop: 8 }}>
          <Avatar src={headshotUrl(f as Record<string, unknown>)} name={f["Name"]} size={44} />
          <h1 style={{ fontSize: 30, fontWeight: 800 }}>{f["Company"]}</h1>
          <StatusPill status={f["Status"]} />
          {finalist && <Link href={`/review/${id}/interview`} className="btn btn-ink btn-sm">Interview page →</Link>}
        </div>
        <p className="body" style={{ marginTop: 6 }}>{f["One-liner"]}</p>
      </div>

      <div className="rv-layout">
        <ApplicationView f={f} />
        <aside className="sticky" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Scorecard appId={id} stage="Screen" mine={mine} />
          <OtherReviews reviews={reviews} stage="Screen" reviewerNames={publicReviewers().map((r) => r.name)} />
          <StatusControl appId={id} status={f["Status"] || "Submitted"} packetUrl={siteUrl(`/packet/${f["Resume Token"]}`)} />
        </aside>
      </div>
    </div>
  );
}
