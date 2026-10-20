import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession, type Reviewer } from "./auth";

// Server-side helper for route handlers and server components.
export async function currentReviewer(): Promise<Reviewer | null> {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}

export async function requireReviewer(): Promise<Reviewer> {
  const r = await currentReviewer();
  if (!r) throw new Error("Unauthorized");
  return r;
}
