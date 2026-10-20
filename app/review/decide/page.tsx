import { redirect } from "next/navigation";
import { listApplications, listAllReviews, reviewAverage, headshotUrl } from "@/lib/review-data";
import { currentReviewer } from "@/lib/session";
import { screeningReviewers } from "@/lib/auth";
import { DecideTable, type DecideRow } from "@/components/review/DecideTable";
import { DataError } from "@/components/review/DataError";

export const dynamic = "force-dynamic";

export default async function DecidePage() {
  const me = await currentReviewer();
  if (me && !me.screens) redirect("/review/interviews");
  let apps, reviewsByApp;
  try {
    [apps, reviewsByApp] = await Promise.all([listApplications(), listAllReviews()]);
  } catch (e) {
    return <DataError error={e} />;
  }
  const reviewers = screeningReviewers();
  const submitted = apps.filter((a) => a.fields["Status"] === "Submitted");
  const alreadyAdvanced = apps.filter((a) => ["Finalist", "Interviewed", "Selected", "Declined"].includes(a.fields["Status"] || "")).length;

  const rows: DecideRow[] = submitted.map((a) => {
    const screen = (reviewsByApp[a.id] || []).filter((r) => r.stage === "Screen");
    const per = reviewers.map((rv) => {
      const r = screen.find((x) => x.reviewer === rv.email);
      return { name: rv.name.split(" ")[0], avg: r ? reviewAverage(r) : null, rec: r?.recommendation, notes: r?.notes };
    });
    const avgs = per.map((p) => p.avg).filter((v): v is number => v !== null);
    return {
      id: a.id,
      company: a.fields["Company"] || "",
      name: a.fields["Name"] || "",
      photo: headshotUrl(a.fields as Record<string, unknown>),
      region: a.fields["Region"] || "",
      shortlist: Boolean((a.fields as Record<string, unknown>)["Shortlist"]),
      per,
      avg: avgs.length ? avgs.reduce((x, y) => x + y, 0) / avgs.length : null,
      scoredBy: avgs.length,
    };
  });

  return <DecideTable rows={rows} reviewerNames={reviewers.map((r) => r.name.split(" ")[0])} alreadyAdvanced={alreadyAdvanced} />;
}
