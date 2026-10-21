import { NextResponse } from "next/server";
import { requireReviewer } from "@/lib/session";
import { listApplications, updateApplication } from "@/lib/review-data";
import { setSetting } from "@/lib/settings";

export const runtime = "nodejs";

// "Finish deciding": invites are made one at a time from the Decide list, so
// this only has to mark whatever is still Submitted as Not selected and close
// applications. (Legacy: any row still carrying the old Shortlist flag is
// treated as invited.)
export async function POST(req: Request) {
  const me = await requireReviewer();
  if (!me.screens) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = (await req.json().catch(() => ({}))) as { closeRound?: boolean };

  const apps = await listApplications();
  const submitted = apps.filter((a) => a.fields["Status"] === "Submitted");
  let finalists = 0;
  let notSelected = 0;
  for (const a of submitted) {
    const legacyShortlist = Boolean((a.fields as Record<string, unknown>)["Shortlist"]);
    if (legacyShortlist) {
      await updateApplication(a.id, { Status: "Finalist", Shortlist: false });
      finalists++;
    } else if (body.closeRound) {
      await updateApplication(a.id, { Status: "Not selected" });
      notSelected++;
    }
  }
  if (body.closeRound) await setSetting("accepting", "false");
  return NextResponse.json({ ok: true, finalists, notSelected });
}
