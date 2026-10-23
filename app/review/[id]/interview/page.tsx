import Link from "next/link";
import { notFound } from "next/navigation";
import { getApplication, listReviewsFor, summarize } from "@/lib/review-data";
import { currentReviewer } from "@/lib/session";
import { formatUSD } from "@/lib/schema";
import { ApplicationView } from "@/components/review/ApplicationView";
import { LiveInterview } from "@/components/review/LiveInterview";
import { InterviewAgenda } from "@/components/review/InterviewAgenda";
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
  const when = f["Interview Time"] ? new Date(f["Interview Time"]) : null;
  const packet = Boolean(f["Packet Submitted At"]);
  const raised = f["Has Raised"] === "No" ? "None" : formatUSD(f["Total Raised"]);
  const first = (f["Name"] || "").split(" ")[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <Link href="/review/interviews" className="small muted" style={{ textDecoration: "none" }}>← Interviews</Link>
        <Link href={`/review/${id}`} className="small muted" style={{ textDecoration: "none" }}>Screening page →</Link>
      </div>

      {/* Hero: who we're meeting */}
      <section className="iv-hero">
        <div className="iv-hero-left">
          <Avatar src={headshotUrl(f as Record<string, unknown>)} name={f["Name"]} size={96} />
          <div style={{ minWidth: 0 }}>
            <div className="eyebrow" style={{ color: "var(--accent-on-dark)" }}>Interview{when ? ` · ${when.toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}` : " · time not set"}</div>
            <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1, marginTop: 6 }}>{f["Name"]}</h1>
            <p style={{ fontSize: 17, marginTop: 6, color: "var(--on-dark-body)" }}><b style={{ color: "#fff" }}>{f["Company"]}</b>{f["Role"] ? ` · ${f["Role"]}` : ""} · {f["Region"]}</p>
            <p style={{ fontSize: 15, marginTop: 8, color: "var(--on-dark-muted)", maxWidth: 560 }}>{f["One-liner"]}</p>
            <div className="chip-row">
              <Chip href={f["LinkedIn"]}>LinkedIn</Chip>
              <Chip href={f["Website"]}>Website</Chip>
              <Chip href={f["Packet Deck"] || f["Deck URL"]}>Deck</Chip>
              <Chip href={f["Packet Financials"]}>Financials</Chip>
              <Chip href={f["Packet Cap Table"]}>Cap table</Chip>
              {f["Packet 409A"] && <Chip href={f["Packet 409A"]}>409A</Chip>}
              {!packet && <CopyLink url={siteUrl(`/packet/${f["Resume Token"]}`)} label="Materials not received · copy request link for the founder" className="chip muted-chip" />}
            </div>
          </div>
        </div>
        <div className="stat-grid">
          <Stat label="Screening avg" value={fmt(sum.avg)} sub={screening.map((r) => `${r.reviewerName.split(" ")[0]}: ${r.recommendation || "—"}`).join(" · ")} />
          <Stat label="Raised to date" value={raised} sub={f["Last Round"] || (f["Has Raised"] === "No" ? "No outside investment" : "")} />
          <Stat label="Raising" value={f["Raising"] || "—"} sub={f["Raise Details"] || ""} />
          <Stat label="Standard terms" value={f["Terms OK"] || "—"} sub={f["Terms Notes"] || ""} />
        </div>
      </section>

      <div className="rv-layout iv-layout">
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div className="box" style={{ gap: 16 }}>
            <div>
              <h3 style={{ margin: 0 }}>Areas to cover</h3>
              <p className="small muted" style={{ margin: "4px 0 0" }}>What the committee usually gets to in 45 minutes. Sample questions, not a script; pick up whatever is most useful for {first}.</p>
            </div>
            <InterviewAgenda />
          </div>

          <div className="box" style={{ gap: 14 }}>
            <h3 style={{ margin: 0 }}>Highlights of {first}&apos;s application</h3>
            <dl className="kv">
              <dt>Traction</dt><dd>{f["Traction"]}</dd>
              <dt>Team</dt><dd>{f["Team"]}</dd>
              <dt>Puerto Rico</dt><dd>{f["PR Connection"]}</dd>
              <dt>Investors</dt><dd>{f["Has Raised"] === "No" ? "None yet" : f["Investors"] || "—"}</dd>
              <dt>Cash &amp; burn</dt><dd>{f["Cash and Burn"]}</dd>
              {f["Packet Notes"] && <><dt>From the founder</dt><dd>{f["Packet Notes"]}</dd></>}
            </dl>
            {screening.length > 0 && (
              <div className="screen-notes">
                {screening.map((r) => (
                  <div key={r.id} className="screen-note">
                    <span className="lane-avatar" style={{ background: "var(--ink)" }}>{r.reviewerName[0]}</span>
                    <div>
                      <div className="small" style={{ fontWeight: 700 }}>{r.reviewerName.split(" ")[0]}&apos;s screening notes{r.recommendation ? ` · ${r.recommendation}` : ""}</div>
                      <div className="small body">{r.notes || <span className="muted">No notes</span>}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <details className="box" style={{ gap: 0 }}>
            <summary style={{ cursor: "pointer", fontWeight: 700, fontSize: 15 }}>{first}&apos;s full application</summary>
            <div style={{ marginTop: 16 }}><ApplicationView f={f} /></div>
          </details>
        </div>

        <aside className="sticky" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <LiveInterview
            appId={id}
            me={me}
            initialReviews={reviews}
            initialPrepNotes={f["Prep Notes"] || ""}
            initialInterviewTime={f["Interview Time"] || ""}
            initialDecisionNotes={f["Decision Notes"] || ""}
          />
          <StatusControl appId={id} status={f["Status"] || "Finalist"} />
        </aside>
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="stat-tile">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
      {sub && <span className="stat-sub" title={sub}>{sub}</span>}
    </div>
  );
}

function Chip({ href, children }: { href?: string; children: React.ReactNode }) {
  if (!href) return null;
  const url = /^https?:\/\//i.test(href) ? href : `https://${href}`;
  return <a className="chip" href={url} target="_blank" rel="noreferrer">{children} ↗</a>;
}
