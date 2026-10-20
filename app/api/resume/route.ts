import { NextResponse } from "next/server";
import { listRecords, q, TABLES } from "@/lib/airtable";
import { sendEmail, siteUrl } from "@/lib/email";

export const runtime = "nodejs";

// "Resume your application": re-sends the private resume link to the email on
// the draft. Always responds the same way so it can't be used to probe emails.
export async function POST(req: Request) {
  const { email } = (await req.json()) as { email?: string };
  const addr = (email || "").trim().toLowerCase();
  if (!addr) return NextResponse.json({ error: "Email required" }, { status: 400 });
  if (!process.env.RESEND_API_KEY) return NextResponse.json({ error: "not-configured" }, { status: 501 });

  const recs = await listRecords<Record<string, string>>(TABLES.applications, {
    filterByFormula: `AND(LOWER({Email}) = ${q(addr)}, {Status} = "Draft")`,
    maxRecords: 1,
    fields: ["Resume Token", "Company", "Name"],
  });
  const rec = recs[0];
  if (rec?.fields["Resume Token"]) {
    const link = siteUrl(`/resume/${rec.fields["Resume Token"]}`);
    await sendEmail({
      to: addr,
      subject: "Your Bravo Venture Fellowship application",
      text: `Pick up your application${rec.fields["Company"] ? ` for ${rec.fields["Company"]}` : ""} where you left off:\n\n${link}\n\nThis link is private to you.\n\n— Bravo Family Foundation`,
    });
  }
  return NextResponse.json({ ok: true });
}
