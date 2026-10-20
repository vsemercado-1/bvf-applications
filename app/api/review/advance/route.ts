import { NextResponse } from "next/server";
import { requireReviewer } from "@/lib/session";
import { listApplications, updateApplication } from "@/lib/review-data";
import { setSetting } from "@/lib/settings";

export const runtime = "nodejs";

// Advances every shortlisted Submitted application to Finalist, marks the rest
// Not selected, and closes applications.
export async function POST() {
  const me = await requireReviewer();
  if (!me.screens) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const apps = await listApplications();
  const submitted = apps.filter((a) => a.fields["Status"] === "Submitted");
  let finalists = 0;
  for (const a of submitted) {
    const on = Boolean((a.fields as Record<string, unknown>)["Shortlist"]);
    await updateApplication(a.id, { Status: on ? "Finalist" : "Not selected" });
    if (on) finalists++;
  }
  await setSetting("accepting", "false");
  return NextResponse.json({ ok: true, finalists, notSelected: submitted.length - finalists });
}
