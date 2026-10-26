import Link from "next/link";
import { listApplications, listAllReviews, summarize } from "@/lib/review-data";
import { StatusPill, fmt } from "@/components/review/StatusPill";
import { DataError } from "@/components/review/DataError";
import { StageBar } from "@/components/review/StageBar";
import { InterviewTimeCell } from "@/components/review/InterviewTimeCell";
import { getRoundState } from "@/lib/stage";

export const dynamic = "force-dynamic";

export default async function InterviewsPage() {
  let apps, reviewsByApp, st;
  try {
    [apps, reviewsByApp, st] = await Promise.all([listApplications(), listAllReviews(), getRoundState()]);
  } catch (e) {
    return <DataError error={e} />;
  }
  const finalists = apps
    .filter((a) => ["Finalist", "Interviewed", "Selected", "Declined"].includes(a.fields["Status"] || ""))
    .map((a) => ({ a, s: summarize(reviewsByApp[a.id] || []) }))
    .sort((x, y) => (x.a.fields["Interview Time"] || "9").localeCompare(y.a.fields["Interview Time"] || "9"));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="box" style={{ padding: "22px 24px", marginBottom: 12 }}>
        <StageBar current={st.current} counts={st.counts} viewing="interview" />
      </div>
      <h1 style={{ fontSize: 30, fontWeight: 800 }}>Interview: 45 minutes with each finalist</h1>
      <p className="muted small">
        Set each interview time here. On the day, open the founder&apos;s name to score live.
      </p>
      <table className="table">
        <thead>
          <tr><th>When</th><th>Founder</th><th>Company</th><th>Materials</th><th>Screen avg</th><th>Interview avg</th><th>Decisions</th><th>Status</th></tr>
        </thead>
        <tbody>
          {finalists.length === 0 && <tr><td colSpan={8} className="muted" style={{ textAlign: "center", padding: 32 }}>No finalists yet. Invite founders from Home once screening is done.</td></tr>}
          {finalists.map(({ a, s }) => {
            const f = a.fields;
            const decisions = s.reviews.filter((r) => r.stage === "Interview" && r.decision).map((r) => r.decision);
            return (
              <tr key={a.id}>
                <td className="small"><InterviewTimeCell appId={a.id} iso={f["Interview Time"]} /></td>
                <td><Link href={`/review/${a.id}/interview`} style={{ fontWeight: 700 }}>{f["Name"]}</Link></td>
                <td>{f["Company"]}</td>
                <td className="small">{f["Packet Submitted At"] ? "Received" : <span className="muted">Waiting</span>}</td>
                <td>{fmt(s.avg)}</td>
                <td>{fmt(s.interviewAvg)}</td>
                <td className="small">{decisions.length ? decisions.join(" · ") : <span className="muted">—</span>}</td>
                <td><StatusPill status={f["Status"]} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  } catch {
    return iso;
  }
}
