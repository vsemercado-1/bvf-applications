import { listRecords, updateRecord, createRecord, q } from "./airtable";

// Site settings stored in the Airtable "Settings" table (Key / Value rows),
// so the committee can open and close applications and move the deadline
// without a redeploy.

export interface Settings {
  accepting: boolean;
  deadline: string; // YYYY-MM-DD, closes at 11:59 PM Pacific
  closedMessage: string;
}

const DEFAULTS: Settings = {
  accepting: true,
  deadline: process.env.NEXT_PUBLIC_DEADLINE || "2027-01-15",
  closedMessage: "Applications are closed. Thank you to everyone who applied.",
};

export async function getSettings(): Promise<Settings> {
  try {
    const recs = await listRecords<{ Key?: string; Value?: string }>("Settings");
    const map = Object.fromEntries(recs.map((r) => [r.fields.Key || "", r.fields.Value || ""]));
    const s: Settings = {
      accepting: (map["accepting"] || "true").toLowerCase() !== "false",
      deadline: /^\d{4}-\d{2}-\d{2}$/.test(map["deadline"] || "") ? map["deadline"] : DEFAULTS.deadline,
      closedMessage: map["closed_message"] || DEFAULTS.closedMessage,
    };
    // Past the deadline counts as closed even if the switch is still on.
    if (new Date(`${s.deadline}T23:59:59-08:00`) < new Date()) s.accepting = false;
    return s;
  } catch {
    return DEFAULTS;
  }
}

export async function setSetting(key: string, value: string): Promise<void> {
  const recs = await listRecords("Settings", { filterByFormula: `{Key} = ${q(key)}`, maxRecords: 1 });
  if (recs[0]) await updateRecord("Settings", recs[0].id, { Value: value });
  else await createRecord("Settings", { Key: key, Value: value });
}

export function deadlineLong(deadline: string): string {
  const d = new Date(deadline + "T12:00:00Z");
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
}

