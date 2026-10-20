import { listApplications, listAllReviews, summarize, reviewAverage } from "@/lib/review-data";
import { currentReviewer } from "@/lib/session";
import { ApplicationsTable, type Row } from "@/components/review/ApplicationsTable";
import { DataError } from "@/components/review/DataError";

export const dynamic = "force-dynamic";

export default async function ReviewHome() {
  const me = await currentReviewer();
  let apps, reviewsByApp;
  try {
    [apps, reviewsByApp] = await Promise.all([listApplications(), listAllReviews()]);
  } catch (e) {
    return <DataError error={e} />;
  }

  const rows: Row[] = apps.map((a) => {
    const summary = summarize(reviewsByApp[a.id] || []);
    const mine = summary.reviews.find((r) => r.stage === "Screen" && r.reviewer === me?.email);
    return {
      id: a.id,
      name: a.fields["Name"] || "",
      company: a.fields["Company"] || "",
      oneLiner: a.fields["One-liner"] || "",
      region: a.fields["Region"] || "",
      status: a.fields["Status"] || "",
      submittedAt: a.fields["Submitted At"],
      raising: a.fields["Raising"] || "",
      termsOk: a.fields["Terms OK"] || "",
      myScore: mine ? reviewAverage(mine) : null,
      myRec: mine?.recommendation,
      avg: summary.avg,
      reviewerCount: summary.reviews.filter((r) => r.stage === "Screen").length,
    };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Applications</h1>
      <p className="muted small">
        {rows.length} received · {rows.filter((r) => r.status === "Submitted").length} awaiting a decision ·{" "}
        {rows.filter((r) => ["Finalist", "Interviewed"].includes(r.status)).length} finalists ·{" "}
        {rows.filter((r) => r.status === "Selected").length} selected
      </p>
      <ApplicationsTable rows={rows} />
    </div>
  );
}
