import { redirect } from "next/navigation";
import Link from "next/link";
import { listApplications, listAllReviews, reviewAverage, headshotUrl } from "@/lib/review-data";
import { currentReviewer } from "@/lib/session";
import { ApplicationsTable, type Row } from "@/components/review/ApplicationsTable";
import { DataError } from "@/components/review/DataError";

export const dynamic = "force-dynamic";

export default async function ScreeningPage() {
  const me = await currentReviewer();
  if (me && !me.screens) redirect("/review/interviews");
  let apps, reviewsByApp;
  try {
    [apps, reviewsByApp] = await Promise.all([listApplications(), listAllReviews()]);
  } catch (e) {
    return <DataError error={e} />;
  }

  const submitted = apps.filter((a) => a.fields["Status"] === "Submitted");
  const advanced = apps.filter((a) => ["Finalist", "Interviewed", "Selected", "Declined"].includes(a.fields["Status"] || "")).length;

  const rows: Row[] = submitted.map((a) => {
    const mine = (reviewsByApp[a.id] || []).find((r) => r.stage === "Screen" && r.reviewer === me?.email);
    return {
      id: a.id,
      name: a.fields["Name"] || "",
      photo: headshotUrl(a.fields as Record<string, unknown>),
      company: a.fields["Company"] || "",
      oneLiner: a.fields["One-liner"] || "",
      region: a.fields["Region"] || "",
      submittedAt: a.fields["Submitted At"],
      investors: a.fields["Has Raised"] === "No" ? "" : a.fields["Investors"] || "",
      raising: a.fields["Raising"] || "",
      myScore: mine ? reviewAverage(mine) : null,
      myRec: mine?.recommendation,
    };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>Screening</h1>
          <p className="muted small">Score each application on your own. Other reviewers’ scores stay hidden until Decide, where you compare and pick finalists together.</p>
        </div>
        <Link href="/review/decide" className="btn btn-ghost btn-sm">Decide →</Link>
      </div>
      {advanced > 0 && submitted.length === 0 ? (
        <p className="notice">Screening is complete. {advanced} finalists were advanced to <Link href="/review/interviews">Interviews</Link>.</p>
      ) : (
        <ApplicationsTable rows={rows} />
      )}
    </div>
  );
}
