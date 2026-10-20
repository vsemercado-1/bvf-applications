import { NextResponse } from "next/server";
import { upsertReview } from "@/lib/review-data";
import { requireReviewer } from "@/lib/session";
import { SCORE_AXES, RECOMMENDATIONS, DECISIONS } from "@/lib/schema";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const reviewer = await requireReviewer();
  const body = (await req.json()) as {
    appId: string;
    stage: "Screen" | "Interview";
    scores?: Record<string, number | null>;
    notes?: string;
    recommendation?: string;
    decision?: string;
  };
  if (!body.appId || !["Screen", "Interview"].includes(body.stage)) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  const scores: Record<string, number | null> = {};
  for (const a of SCORE_AXES) {
    const v = body.scores?.[a.key];
    if (v === null) scores[a.key] = null;
    else if (typeof v === "number" && v >= 1 && v <= 5) scores[a.key] = Math.round(v);
  }
  if (body.recommendation && !(RECOMMENDATIONS as readonly string[]).includes(body.recommendation)) {
    return NextResponse.json({ error: "Bad recommendation" }, { status: 400 });
  }
  if (body.decision && !(DECISIONS as readonly string[]).includes(body.decision)) {
    return NextResponse.json({ error: "Bad decision" }, { status: 400 });
  }
  const review = await upsertReview({
    appId: body.appId,
    reviewer: { email: reviewer.email, name: reviewer.name },
    stage: body.stage,
    scores,
    notes: body.notes,
    recommendation: body.recommendation,
    decision: body.decision,
  });
  return NextResponse.json({ ok: true, review });
}
