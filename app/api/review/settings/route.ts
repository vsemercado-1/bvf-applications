import { NextResponse } from "next/server";
import { requireReviewer } from "@/lib/session";
import { setSetting } from "@/lib/settings";

export const runtime = "nodejs";

export async function PATCH(req: Request) {
  await requireReviewer();
  const body = (await req.json()) as { accepting?: boolean; deadline?: string; closedMessage?: string };
  if (typeof body.accepting === "boolean") await setSetting("accepting", String(body.accepting));
  if (typeof body.deadline === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.deadline)) await setSetting("deadline", body.deadline);
  if (typeof body.closedMessage === "string") await setSetting("closed_message", body.closedMessage.slice(0, 500));
  return NextResponse.json({ ok: true });
}
