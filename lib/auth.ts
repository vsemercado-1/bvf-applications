// Reviewer authentication. Three reviewers, defined in the REVIEWERS env var.
// Sessions are HMAC-signed cookies; no database and no extra dependencies.
// Uses Web Crypto so it runs in both the Node runtime and Edge middleware.

export interface Reviewer {
  name: string;
  email: string;
  lane: "strategy" | "impact" | "finance";
}

interface ReviewerWithPassword extends Reviewer {
  password: string;
}

export const SESSION_COOKIE = "bvf_review";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 14; // 14 days

function reviewers(): ReviewerWithPassword[] {
  const raw = process.env.REVIEWERS;
  if (!raw) return [];
  try {
    return JSON.parse(raw) as ReviewerWithPassword[];
  } catch {
    throw new Error("REVIEWERS must be a JSON array");
  }
}

export function publicReviewers(): Reviewer[] {
  return reviewers().map(({ name, email, lane }) => ({ name, email, lane }));
}

export function findReviewer(email: string, password: string): Reviewer | null {
  const r = reviewers().find((x) => x.email.toLowerCase() === email.toLowerCase() && x.password === password);
  if (!r) return null;
  return { name: r.name, email: r.email, lane: r.lane };
}

const enc = new TextEncoder();

async function key(): Promise<CryptoKey> {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) throw new Error("SESSION_SECRET must be set (16+ characters)");
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

function b64url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  arr.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string): Uint8Array<ArrayBuffer> {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const out = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function createSession(reviewer: Reviewer): Promise<string> {
  const payload = { ...reviewer, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS };
  const body = b64url(enc.encode(JSON.stringify(payload)));
  const sig = b64url(await crypto.subtle.sign("HMAC", await key(), enc.encode(body)));
  return `${body}.${sig}`;
}

export async function verifySession(token: string | undefined): Promise<Reviewer | null> {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  try {
    const ok = await crypto.subtle.verify("HMAC", await key(), fromB64url(sig), enc.encode(body));
    if (!ok) return null;
    const payload = JSON.parse(new TextDecoder().decode(fromB64url(body))) as Reviewer & { exp: number };
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return { name: payload.name, email: payload.email, lane: payload.lane };
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_TTL_SECONDS,
};
