import { createRecord, getRecord, listRecords, updateRecord, q, TABLES, type Record_ } from "./airtable";
import { SCORE_AXES } from "./schema";

export type AppFields = Record<string, string | undefined>;

export interface Review {
  id: string;
  reviewer: string; // email
  reviewerName: string;
  stage: "Screen" | "Interview";
  scores: Record<string, number | undefined>;
  notes?: string;
  recommendation?: string;
  decision?: string;
  updatedAt?: string;
}

export interface ReviewSummary {
  reviews: Review[];
  avg: number | null; // average of each reviewer's average, screening stage
  interviewAvg: number | null;
}

export async function listApplications(): Promise<Record_<AppFields>[]> {
  return listRecords<AppFields>(TABLES.applications, {
    filterByFormula: `{Status} != "Draft"`,
    sort: [{ field: "Submitted At", direction: "desc" }],
  });
}

export async function getApplication(id: string): Promise<Record_<AppFields>> {
  return getRecord<AppFields>(TABLES.applications, id);
}

export async function listAllReviews(): Promise<Record<string, Review[]>> {
  const recs = await listRecords<Record<string, unknown>>(TABLES.reviews);
  const byApp: Record<string, Review[]> = {};
  for (const r of recs) {
    const review = toReview(r);
    const appIds = (r.fields["Application"] as string[] | undefined) || [];
    for (const appId of appIds) {
      (byApp[appId] ||= []).push(review);
    }
  }
  return byApp;
}

export async function listReviewsFor(appId: string): Promise<Review[]> {
  // "Application ID" is a lookup of the linked application's RECORD_ID().
  const recs = await listRecords<Record<string, unknown>>(TABLES.reviews, {
    filterByFormula: `ARRAYJOIN({Application ID}) = ${q(appId)}`,
  });
  return recs.map(toReview);
}

function toReview(r: Record_<Record<string, unknown>>): Review {
  const f = r.fields;
  const scores: Record<string, number | undefined> = {};
  for (const a of SCORE_AXES) {
    const v = f[a.key];
    scores[a.key] = typeof v === "number" ? v : undefined;
  }
  return {
    id: r.id,
    reviewer: String(f["Reviewer"] || ""),
    reviewerName: String(f["Reviewer Name"] || ""),
    stage: (f["Stage"] as "Screen" | "Interview") || "Screen",
    scores,
    notes: f["Notes"] as string | undefined,
    recommendation: f["Recommendation"] as string | undefined,
    decision: f["Decision"] as string | undefined,
    updatedAt: f["Updated At"] as string | undefined,
  };
}

export function reviewAverage(r: Review): number | null {
  const vals = Object.values(r.scores).filter((v): v is number => typeof v === "number");
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export function summarize(reviews: Review[]): ReviewSummary {
  const avgOf = (stage: Review["stage"]) => {
    const avgs = reviews.filter((r) => r.stage === stage).map(reviewAverage).filter((v): v is number => v !== null);
    return avgs.length ? avgs.reduce((a, b) => a + b, 0) / avgs.length : null;
  };
  return { reviews, avg: avgOf("Screen"), interviewAvg: avgOf("Interview") };
}

export async function upsertReview(input: {
  appId: string;
  reviewer: { email: string; name: string };
  stage: "Screen" | "Interview";
  scores: Record<string, number | null>;
  notes?: string;
  recommendation?: string;
  decision?: string;
}): Promise<Review> {
  const existing = await listRecords<Record<string, unknown>>(TABLES.reviews, {
    filterByFormula: `AND(ARRAYJOIN({Application ID}) = ${q(input.appId)}, {Reviewer} = ${q(input.reviewer.email)}, {Stage} = ${q(input.stage)})`,
    maxRecords: 1,
  });
  const fields: Record<string, unknown> = {
    Key: `${input.reviewer.name.split(" ")[0]} · ${input.stage}`,
    Reviewer: input.reviewer.email,
    "Reviewer Name": input.reviewer.name,
    Stage: input.stage,
    "Updated At": new Date().toISOString(),
  };
  for (const a of SCORE_AXES) {
    const v = input.scores[a.key];
    if (v === null) fields[a.key] = null;
    else if (typeof v === "number") fields[a.key] = v;
  }
  if (input.notes !== undefined) fields["Notes"] = input.notes;
  if (input.recommendation !== undefined) fields["Recommendation"] = input.recommendation || null;
  if (input.decision !== undefined) fields["Decision"] = input.decision || null;

  const rec = existing[0]
    ? await updateRecord(TABLES.reviews, existing[0].id, fields)
    : await createRecord(TABLES.reviews, { ...fields, Application: [input.appId] });
  return toReview(rec as Record_<Record<string, unknown>>);
}

export async function updateApplication(id: string, fields: Partial<AppFields>) {
  return updateRecord<AppFields>(TABLES.applications, id, fields);
}
