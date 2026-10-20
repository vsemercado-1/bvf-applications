import { NextResponse } from "next/server";
import { createSession, findReviewer, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { email, password } = (await req.json()) as { email?: string; password?: string };
  if (!email || !password) return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  const reviewer = findReviewer(email, password);
  if (!reviewer) {
    await new Promise((r) => setTimeout(r, 400)); // slow down guessing a little
    return NextResponse.json({ error: "Incorrect email or password" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true, reviewer });
  res.cookies.set(SESSION_COOKIE, await createSession(reviewer), sessionCookieOptions);
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions, maxAge: 0 });
  return res;
}
