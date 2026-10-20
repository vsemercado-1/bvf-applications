import Link from "next/link";
import { notFound } from "next/navigation";
import { getApplication, listReviewsFor } from "@/lib/review-data";
import { currentReviewer } from "@/lib/session";
import { publicReviewers } from "@/lib/auth";
import { LANES } from "@/lib/schema";
import { ApplicationView } from "@/components/review/ApplicationView";
import { LiveInterview } from "@/components/review/LiveInterview";
import { StatusPill } from "@/components/review/StatusPill";
import { Avatar } from "@/components/Avatar";
import { headshotUrl } from "@/lib/review-data";

export const dynamic = "force-dynamic";

export default async function InterviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const me = await currentReviewer();
  if (!me) notFound();
  let app;
  try {
    app = await getApplication(id);
  } catch {
    notFound();
  }
  const reviews = await listReviewsFor(id);
  const f = app.fields;
  const screening = reviews.filter((r) => r.stage === "Screen" && r.notes);
  const reviewers = publicReviewers();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <Link href="/review/interviews" className="small muted" style={{ textDecoration: "none" }}>← Interviews</Link>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginTop: 8 }}>
          <Avatar src={headshotUrl(f as Record<string, unknown>)} name={f["Name"]} size={44} />
          <h1 style={{ fontSize: 30, fontWeight: 800 }}>{f["Company"]}</h1>
          <StatusPill status={f["Status"]} />
          <Link href={`/review/${id}`} className="small" style={{ marginLeft: "auto" }}>Screening page</Link>
        </div>
        <p className="body" style={{ marginTop: 6 }}>{f["Name"]} · {f["Role"]} · {f["Region"]}</p>
      </div>

      <div className="rv-layout">
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="box">
            <h3>Quick summary</h3>
            <dl className="kv">
              <dt>Company</dt><dd>{f["One-liner"]}</dd>
              <dt>Puerto Rico</dt><dd>{f["PR Connection"]}</dd>
              <dt>Traction</dt><dd>{f["Traction"]}</dd>
              <dt>Team</dt><dd>{f["Team"]}</dd>
              <dt>Raised to date</dt><dd>{f["Has Raised"] === "No" ? "None (no outside investment)" : f["Total Raised"]}</dd>
              <dt>Last round</dt><dd>{f["Last Round"] || "—"}</dd>
              <dt>Cash &amp; burn</dt><dd>{f["Cash and Burn"]}</dd>
              <dt>Raising</dt><dd>{f["Raising"]}{f["Raise Details"] ? ` — ${f["Raise Details"]}` : ""}</dd>
              <dt>Standard terms</dt><dd>{f["Terms OK"]}</dd>
              <dt>Materials</dt>
              <dd>
                {f["Packet Submitted At"] ? (
                  <span>
                    <Ext href={f["Packet Deck"]}>Deck</Ext> · <Ext href={f["Packet Financials"]}>Financials</Ext> · <Ext href={f["Packet Cap Table"]}>Cap table</Ext>
                  </span>
                ) : (
                  <span className="muted">Not yet received</span>
                )}
              </dd>
            </dl>
            {f["Packet Notes"] && (
              <div className="answer"><span className="q">From the founder</span><span className="a">{f["Packet Notes"]}</span></div>
            )}
          </div>

          <div className="box">
            <h3>Question lanes</h3>
            <p className="small muted">Each reviewer leads one lane. The prompts are starting points; the prep notes on the right are where the specific questions for this founder go.</p>
            {reviewers.map((r) => {
              const lane = LANES[r.lane];
              return (
                <div className="lane" key={r.email} style={{ borderColor: r.email === me.email ? "var(--accent)" : "var(--line-2)" }}>
                  <b>{lane.title} — {r.name.split(" ")[0]}{r.email === me.email ? " (you)" : ""}</b>
                  <span className="small muted">{lane.goal}</span>
                  <ul>
                    {lane.prompts.map((p) => <li key={p}>{p}</li>)}
                  </ul>
                </div>
              );
            })}
          </div>

          {screening.length > 0 && (
            <div className="box">
              <h3>From screening</h3>
              {screening.map((r) => (
                <div key={r.id} className="answer">
                  <span className="q">{r.reviewerName}{r.recommendation ? ` · ${r.recommendation}` : ""}</span>
                  <span className="a small">{r.notes}</span>
                </div>
              ))}
            </div>
          )}

          <details>
            <summary style={{ cursor: "pointer", fontWeight: 600, padding: "8px 0" }}>Full application</summary>
            <div style={{ marginTop: 12 }}><ApplicationView f={f} /></div>
          </details>
        </div>

        <aside className="sticky">
          <LiveInterview
            appId={id}
            me={me}
            reviewerNames={reviewers.map((r) => r.name)}
            initialReviews={reviews}
            initialPrepNotes={f["Prep Notes"] || ""}
            initialInterviewTime={f["Interview Time"] || ""}
            initialDecisionNotes={f["Decision Notes"] || ""}
          />
        </aside>
      </div>
    </div>
  );
}

function Ext({ href, children }: { href?: string; children: React.ReactNode }) {
  if (!href) return <span className="muted">{children}</span>;
  const url = /^https?:\/\//i.test(href) ? href : `https://${href}`;
  return <a href={url} target="_blank" rel="noreferrer">{children}</a>;
}
