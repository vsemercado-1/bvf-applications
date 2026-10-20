import { NextResponse } from "next/server";
import { listRecords, updateRecord, q, TABLES } from "@/lib/airtable";

export const runtime = "nodejs";

export async function POST(req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const body = (await req.json()) as { deck?: string; financials?: string; capTable?: string; notes?: string };
  const recs = await listRecords(TABLES.applications, {
    filterByFormula: `{Resume Token} = ${q(token)}`,
    maxRecords: 1,
    fields: ["Status"],
  });
  const rec = recs[0];
  if (!rec || !["Finalist", "Interviewed", "Selected"].includes(String(rec.fields["Status"]))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const clean = (s?: string) => (s || "").trim().slice(0, 1000);
  await updateRecord(TABLES.applications, rec.id, {
    "Packet Deck": clean(body.deck),
    "Packet Financials": clean(body.financials),
    "Packet Cap Table": clean(body.capTable),
    "Packet Notes": clean(body.notes).slice(0, 5000),
    "Packet Submitted At": new Date().toISOString(),
  });
  return NextResponse.json({ ok: true });
}
