import Link from "next/link";
import { notFound } from "next/navigation";
import { getApplication, listReviewsFor, summarize } from "@/lib/review-data";
import { currentReviewer } from "@/lib/session";
import { publicReviewers } from "@/lib/auth";
import { formatUSD } from "@/lib/schema";
import { LiveInterview } from "@/components/review/LiveInterview";
import { InterviewAreas } from "@/components/review/InterviewAreas";
import { StatusControl } from "@/components/review/StatusControl";
import { CopyLink } from "@/components/review/CopyLink";
import { fmt } from "@/components/review/StatusPill";
import { siteUrl } from "@/lib/email";
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
  const sum = summarize(reviews);
  const screening = reviews.filter((r) => r.stage === "Screen" && (r.notes || r.recommendation));
  const reviewers = publicReviewers();
  const when = f["Interview Time"] ? new Date(f["Interview Time"]) : null;
  const packet = Boolean(f["Packet Submitted At"]);
  const raised = f["Has Raised"] === "No" ? "None" : formatUSD(f["Total Raised"]);
  const first = (f["Name"] || "").split(" ")[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Link href="/review/interviews" className="small muted" style={{ textDecoration: "none" }}>← Interviews</Link>

      {/* Who we're meeting: one glance */}
      <section className="iv-hero iv-hero-compact">
        <div className="iv-hero-left">
          <Avatar src={headshotUrl(f as Record<string, unknown>)} name={f["Name"]} size={84} />
          <div style={{ minWidth: 0 }}>
            <div className="eyebrow" style={{ color: "var(--accent-on-dark)" }}>Interview{when ? ` · ${when.toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}` : ""}</div>
            <h1 style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1, marginTop: 4 }}>{f["Name"]}</h1>
            <p style={{ fontSize: 16, marginTop: 4, color: "var(--on-dark-body)" }}><b style={{ color: "#fff" }}>{f["Company"]}</b> · {f["Region"]}</p>
            <p style={{ fontSize: 14, marginTop: 6, color: "var(--on-dark-muted)", maxWidth: 520 }}>{f["One-liner"]}</p>
            <div className="chip-row">
              <Chip href={f["Packet Deck"] || f["Deck URL"]}>Deck</Chip>
              <Chip href={f["Packet Financials"]}>Financials</Chip>
              <Chip href={f["Packet Cap Table"]}>Cap table</Chip>
              {f["Packet 409A"] && <Chip href={f["Packet 409A"]}>409A</Chip>}
              <Chip href={f["LinkedIn"]}>LinkedIn</Chip>
              <Chip href={f["Website"]}>Website</Chip>
              {!packet && <CopyLink url={siteUrl(`/packet/${f["Resume Token"]}`)} label="Materials not received · copy request link" className="chip muted-chip" />}
            </div>
          </div>
        </div>
        <div className="stat-grid stat-grid-compact">
          <Stat label="Screening" value={fmt(sum.avg)} />
          <Stat label="Raised" value={raised} />
          <Stat label="Raising" value={f["Raising"] || "—"} />
          <Stat label="Terms" value={f["Terms OK"] || "—"} />
        </div>
      </section>

      <div className="rv-layout iv-layout">
        {/* What you do: score */}
        <LiveInterview
          appId={id}
          me={me}
          initialReviews={reviews}
          fields={f}
          first={first}
        />

        {/* What helps: areas, screening notes, post-call */}
        <aside className="sticky" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <InterviewAreas owners={reviewers.map((r) => ({ lane: r.lane, first: r.name.split(" ")[0], isMe: r.email === me.email }))} />
          {screening.length > 0 && (
            <details className="box" style={{ gap: 0 }}>
              <summary style={{ cursor: "pointer", fontWeight: 700, fontSize: 14 }}>From screening</summary>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
                {screening.map((r) => (
                  <div key={r.id} className="screen-note">
                    <span className="lane-avatar" style={{ background: "var(--ink)" }}>{r.reviewerName[0]}</span>
                    <div>
                      <div className="small" style={{ fontWeight: 700 }}>{r.reviewerName.split(" ")[0]}{r.recommendation ? ` · ${r.recommendation}` : ""}</div>
                      <div className="small body">{r.notes || <span className="muted">No notes</span>}</div>
                    </div>
                  </div>
                ))}
              </div>
            </details>
          )}
          <StatusControl appId={id} status={f["Status"] || "Finalist"} />
        </aside>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-tile">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  );
}

function Chip({ href, children }: { href?: string; children: React.ReactNode }) {
  if (!href) return null;
  const url = /^https?:\/\//i.test(href) ? href : `https://${href}`;
  return <a className="chip" href={url} target="_blank" rel="noreferrer">{children}</a>;
}
