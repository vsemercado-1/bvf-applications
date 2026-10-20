import { NextResponse } from "next/server";
import { createRecord, TABLES } from "@/lib/airtable";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { founder?: string; link?: string; nominator?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const founder = (body.founder || "").trim().slice(0, 200);
  if (!founder) return NextResponse.json({ error: "Founder name required" }, { status: 400 });
  await createRecord(TABLES.nominations, {
    "Founder Name": founder,
    "Company or LinkedIn": (body.link || "").trim().slice(0, 500),
    Nominator: (body.nominator || "").trim().slice(0, 300),
  });
  return NextResponse.json({ ok: true });
}
