import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getApplication, listReviewsFor, listApplications, listAllReviews } from "@/lib/review-data";
import { currentReviewer } from "@/lib/session";
import { ApplicationView } from "@/components/review/ApplicationView";
import { Scorecard } from "@/components/review/Scorecard";
import { StatusPill } from "@/components/review/StatusPill";
import { Avatar } from "@/components/Avatar";
import { headshotUrl } from "@/lib/review-data";

export const dynamic = "force-dynamic";

export default async function ApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const me = await currentReviewer();
  if (!me) notFound();
  let app;
  try {
    app = await getApplication(id);
  } catch {
    notFound();
  }
  const f = app.fields;
  const finalist = ["Finalist", "Interviewed", "Selected", "Declined"].includes(f["Status"] || "");
  if (!me.screens && !finalist) redirect("/review/interviews");

  const reviews = await listReviewsFor(id);
  const mine = reviews.find((r) => r.stage === "Screen" && r.reviewer === me.email);

  // Find the next application this reviewer hasn't scored, for a "next" link.
  let nextId: string | null = null;
  if (me.screens && f["Status"] === "Submitted") {
    const [apps, byApp] = await Promise.all([listApplications(), listAllReviews()]);
    const pending = apps.filter((a) => a.id !== id && a.fields["Status"] === "Submitted" && !(byApp[a.id] || []).some((r) => r.stage === "Screen" && r.reviewer === me.email));
    nextId = pending[0]?.id || null;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <Link href="/review" className="small muted" style={{ textDecoration: "none" }}>← Home</Link>
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
        {me.screens && f["Status"] !== "Draft" && (
          <aside className="sticky" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Scorecard appId={id} stage="Screen" mine={mine} />
            {f["Status"] === "Submitted" ? (
              <div style={{ display: "flex", gap: 10 }}>
                {nextId ? (
                  <Link href={`/review/${nextId}`} className="btn btn-ink btn-sm">Next unscored →</Link>
                ) : (
                  <Link href="/review" className="btn btn-ink btn-sm">All scored · back to Home →</Link>
                )}
              </div>
            ) : (
              <p className="small muted" style={{ margin: 0 }}>Already {f["Status"] === "Finalist" ? "invited to interview" : (f["Status"] || "").toLowerCase()}. You can still revise your screening score; it updates the committee average on Home.</p>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
