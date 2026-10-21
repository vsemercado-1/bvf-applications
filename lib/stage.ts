// The round's lifecycle, computed from data. One place that answers
// "where are we" and "what should this reviewer do next".

import type { Reviewer } from "./auth";
import { screeningReviewers, publicReviewers } from "./auth";
import { listApplications, listAllReviews, reviewAverage, headshotUrl, type Review } from "./review-data";
import { getSettings, type Settings } from "./settings";

export type StageId = "open" | "screen" | "decide" | "interview" | "select" | "announce";
export const STAGES: { id: StageId; label: string }[] = [
  { id: "open", label: "Open" },
  { id: "screen", label: "Screen" },
  { id: "decide", label: "Decide" },
  { id: "interview", label: "Interview" },
  { id: "select", label: "Select" },
  { id: "announce", label: "Announce" },
];

export interface AppRow {
  id: string;
  company: string;
  name: string;
  photo?: string;
  region: string;
  status: string;
  investors: string; // "" when none
  raising: string;
  submittedAt?: string;
  interviewTime?: string;
  packetReceived: boolean;
  termsOk?: string;
  termsNotes?: string;
  // per screening reviewer, keyed by email
  screen: Record<string, { avg: number | null; rec?: string; notes?: string }>;
  screenAvg: number | null;
  // per interview reviewer, keyed by email
  interview: Record<string, { avg: number | null; decision?: string; notes?: string }>;
  interviewAvg: number | null;
}

export interface RoundState {
  settings: Settings;
  reviewers: Reviewer[];
  screeners: Reviewer[];
  rows: AppRow[];
  submitted: AppRow[]; // still to decide
  finalists: AppRow[]; // Finalist or Interviewed
  decided: AppRow[]; // Selected or Declined
  notSelected: AppRow[];
  perScreener: Record<string, { done: number; total: number }>;
  allScreened: boolean;
  current: StageId;
  counts: Record<StageId, string>;
}

function avgOf(nums: (number | null)[]): number | null {
  const v = nums.filter((n): n is number => n !== null);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
}

export async function getRoundState(): Promise<RoundState> {
  const [settings, apps, reviewsByApp] = await Promise.all([getSettings(), listApplications(), listAllReviews()]);
  const reviewers = publicReviewers();
  const screeners = screeningReviewers();

  const rows: AppRow[] = apps.map((a) => {
    const f = a.fields as Record<string, unknown>;
    const reviews: Review[] = reviewsByApp[a.id] || [];
    const screen: AppRow["screen"] = {};
    for (const r of reviews.filter((x) => x.stage === "Screen")) screen[r.reviewer] = { avg: reviewAverage(r), rec: r.recommendation, notes: r.notes };
    const interview: AppRow["interview"] = {};
    for (const r of reviews.filter((x) => x.stage === "Interview")) interview[r.reviewer] = { avg: reviewAverage(r), decision: r.decision, notes: r.notes };
    const s = (k: string) => (typeof f[k] === "string" ? (f[k] as string) : "");
    return {
      id: a.id,
      company: s("Company"),
      name: s("Name"),
      photo: headshotUrl(f),
      region: s("Region"),
      status: s("Status"),
      investors: s("Has Raised") === "No" ? "" : s("Investors"),
      raising: s("Raising"),
      submittedAt: s("Submitted At") || undefined,
      interviewTime: s("Interview Time") || undefined,
      packetReceived: Boolean(f["Packet Submitted At"]),
      termsOk: s("Terms OK") || undefined,
      termsNotes: s("Terms Notes") || undefined,
      screen,
      screenAvg: avgOf(screeners.map((rv) => screen[rv.email]?.avg ?? null)),
      interview,
      interviewAvg: avgOf(reviewers.map((rv) => interview[rv.email]?.avg ?? null)),
    };
  });

  const submitted = rows.filter((r) => r.status === "Submitted");
  const finalists = rows.filter((r) => r.status === "Finalist" || r.status === "Interviewed");
  const decided = rows.filter((r) => r.status === "Selected" || r.status === "Declined");
  const notSelected = rows.filter((r) => r.status === "Not selected");
  const selected = decided.filter((r) => r.status === "Selected");

  const perScreener: RoundState["perScreener"] = {};
  for (const rv of screeners) {
    perScreener[rv.email] = { done: submitted.filter((r) => r.screen[rv.email]?.avg !== undefined && r.screen[rv.email]?.avg !== null).length, total: submitted.length };
  }
  const allScreened = submitted.length > 0 && screeners.every((rv) => perScreener[rv.email].done === submitted.length);

  // Current stage: the first thing that still needs doing.
  let current: StageId;
  if (selected.length > 0 && finalists.length === 0) current = "announce";
  else if (finalists.length > 0 && finalists.every((r) => r.status === "Interviewed")) current = "select";
  else if (finalists.length > 0 && submitted.length === 0) current = "interview";
  else if (allScreened) current = "decide";
  else if (submitted.length > 0) current = "screen";
  else current = "open";

  const received = rows.filter((r) => r.status !== "Draft").length;
  const counts: Record<StageId, string> = {
    open: `${received} received`,
    screen: screeners.map((rv) => `${rv.name.split(" ")[0]} ${perScreener[rv.email].done}/${perScreener[rv.email].total}`).join(" · ") || "—",
    decide: `${finalists.length + decided.length} invited`,
    interview: finalists.length + decided.length > 0 ? `${finalists.filter((r) => r.status === "Interviewed").length + decided.length} of ${finalists.length + decided.length} done` : "—",
    select: `${selected.length} of 2–3`,
    announce: "February",
  };

  return { settings, reviewers, screeners, rows, submitted, finalists, decided, notSelected, perScreener, allScreened, current, counts };
}

export function stageIndex(id: StageId): number {
  return STAGES.findIndex((s) => s.id === id);
}
