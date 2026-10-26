import { NextResponse } from "next/server";
import { getApplication, listReviewsFor, summarize, updateApplication } from "@/lib/review-data";
import { requireReviewer } from "@/lib/session";
import { STATUSES } from "@/lib/schema";

export const runtime = "nodejs";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  await requireReviewer();
  const { id } = await ctx.params;
  const [app, reviews] = await Promise.all([getApplication(id), listReviewsFor(id)]);
  return NextResponse.json({ application: { id: app.id, fields: app.fields }, ...summarize(reviews) });
}

// Status changes, prep notes, interview time, decision notes.
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  await requireReviewer();
  const { id } = await ctx.params;
  const body = (await req.json()) as Record<string, string | boolean | null>;
  const allowed = ["Status", "Prep Notes", "Interview Time", "Decision Notes"];
  const fields: Record<string, string | boolean | null> = {};
  for (const k of allowed) {
    if (typeof body[k] === "string" || (body[k] === null && k === "Interview Time")) fields[k] = body[k];
  }
  if (typeof body["Shortlist"] === "boolean") fields["Shortlist"] = body["Shortlist"];
  if (typeof fields["Status"] === "string" && !(STATUSES as readonly string[]).includes(fields["Status"])) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  const rec = await updateApplication(id, fields);
  return NextResponse.json({ ok: true, fields: rec.fields });
}
