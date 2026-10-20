import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { createRecord, listRecords, updateRecord, q, TABLES } from "@/lib/airtable";
import { ALL_FIELDS, REGIONS, isVisible } from "@/lib/schema";
import { siteUrl } from "@/lib/email";

export const runtime = "nodejs";

interface Body {
  token?: string;
  region: string;
  values: Record<string, string>;
  status?: "Submitted";
}

// Creates or updates an application draft; submits when status === "Submitted".
export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.region || !(REGIONS as readonly string[]).includes(body.region) || body.region === "Other") {
    return NextResponse.json({ error: "Invalid region" }, { status: 400 });
  }

  // Only accept known fields, trimmed, bounded.
  const fields: Record<string, string> = {};
  for (const f of ALL_FIELDS) {
    if (f.type === "image") continue;
    const v = body.values?.[f.key];
    if (typeof v === "string" && v.trim()) fields[f.key] = v.trim().slice(0, 5000);
  }
  const headshot = body.values?.["Headshot"];
  const attachments: Record<string, unknown> = {};
  if (typeof headshot === "string" && /^https:\/\//.test(headshot)) attachments["Headshot"] = [{ url: headshot }];
  fields["Region"] = body.region;
  fields["Descent"] = "Yes";

  const submitting = body.status === "Submitted";
  if (submitting) {
    const missing = ALL_FIELDS.filter((f) => f.required && f.type !== "image" && isVisible(f, fields) && !fields[f.key]).map((f) => f.key);
    if (missing.length) return NextResponse.json({ error: `Missing: ${missing.join(", ")}` }, { status: 400 });
  }

  let token = body.token;
  let recordId: string | null = null;
  let wasNew = false;

  if (token) {
    const existing = await listRecords(TABLES.applications, {
      filterByFormula: `{Resume Token} = ${q(token)}`,
      maxRecords: 1,
      fields: ["Status"],
    });
    if (existing[0]) {
      if (existing[0].fields["Status"] === "Submitted" && !submitting) {
        return NextResponse.json({ error: "This application has already been submitted." }, { status: 409 });
      }
      recordId = existing[0].id;
    }
  }

  if (!recordId) {
    token = randomBytes(18).toString("base64url");
    wasNew = true;
    const rec = await createRecord(TABLES.applications, {
      ...fields,
      ...attachments,
      "Resume Token": token,
      Status: submitting ? "Submitted" : "Draft",
      ...(submitting ? { "Submitted At": new Date().toISOString() } : {}),
    });
    recordId = rec.id;
  } else {
    await updateRecord(TABLES.applications, recordId, {
      ...fields,
      ...attachments,
      ...(submitting ? { Status: "Submitted", "Submitted At": new Date().toISOString() } : {}),
    });
  }

  const resumeUrl = siteUrl(`/resume/${token}`);
  return NextResponse.json({ id: recordId, token, resumeUrl });
}
