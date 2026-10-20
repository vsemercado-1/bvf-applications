// Creates the Airtable base this app expects, with every table and field.
//
// Usage:
//   AIRTABLE_TOKEN=pat... AIRTABLE_WORKSPACE_ID=wsp... node scripts/setup-airtable.mjs
//
// The token needs the "schema.bases:write" scope (plus the data scopes the app
// uses). Find your workspace ID in the Airtable URL when viewing a workspace
// (it starts with "wsp"). The script prints the new base ID to put in
// AIRTABLE_BASE_ID.

const TOKEN = process.env.AIRTABLE_TOKEN;
const WORKSPACE = process.env.AIRTABLE_WORKSPACE_ID;
if (!TOKEN || !WORKSPACE) {
  console.error("Set AIRTABLE_TOKEN and AIRTABLE_WORKSPACE_ID first.");
  process.exit(1);
}

const text = (name) => ({ name, type: "singleLineText" });
const long = (name) => ({ name, type: "multilineText" });
const url = (name) => ({ name, type: "url" });
const email = (name) => ({ name, type: "email" });
const date = (name) => ({ name, type: "dateTime", options: { timeZone: "utc", dateFormat: { name: "iso" }, timeFormat: { name: "24hour" } } });
const select = (name, choices) => ({ name, type: "singleSelect", options: { choices: choices.map((c) => ({ name: c })) } });
const score = (name) => ({ name, type: "number", options: { precision: 0 } });

const applications = {
  name: "Applications",
  description: "One record per application. Drafts become Submitted when the founder submits.",
  fields: [
    text("Name"), // primary
    email("Email"),
    url("LinkedIn"),
    text("Role"),
    select("Descent", ["Yes", "No"]),
    select("Region", ["Puerto Rico", "New York City metro area", "Miami metro area", "San Francisco Bay Area", "Other"]),
    text("PR Connection"),
    text("Company"),
    url("Website"),
    text("One-liner"),
    long("Why You"),
    long("Traction"),
    text("Team"),
    text("Competition"),
    text("Total Raised"),
    text("Last Round"),
    text("Cash and Burn"),
    select("Raising", ["Raising now", "In the next 6 months", "Not right now"]),
    text("Raise Details"),
    select("Terms OK", ["Yes", "Let's discuss", "No"]),
    long("PR Impact"),
    long("Fellowship Goals"),
    url("Deck URL"),
    url("Demo URL"),
    text("Heard From"),
    select("Status", ["Draft", "Submitted", "Screened out", "Not yet", "Finalist", "Interviewed", "Selected", "Declined"]),
    text("Resume Token"),
    date("Submitted At"),
    url("Packet Deck"),
    url("Packet Financials"),
    url("Packet Cap Table"),
    long("Packet Notes"),
    date("Packet Submitted At"),
    date("Interview Time"),
    long("Prep Notes"),
    long("Decision Notes"),
  ],
};

const reviews = {
  name: "Reviews",
  description: "One record per reviewer per application per stage (Screen or Interview).",
  fields: [
    text("Key"), // primary; set by the app as a readable label
    text("Reviewer"),
    text("Reviewer Name"),
    select("Stage", ["Screen", "Interview"]),
    score("PR Connection Score"),
    score("Founder Fit Score"),
    score("Demand Score"),
    score("Catalytic Score"),
    score("PR Impact Score"),
    long("Notes"),
    select("Recommendation", ["Interview", "Not yet", "Pass"]),
    select("Decision", ["Select", "Decline", "Undecided"]),
    date("Updated At"),
  ],
};

const nominations = {
  name: "Nominations",
  description: "Founders referred through the public site.",
  fields: [text("Founder Name"), text("Company or LinkedIn"), text("Nominator"), { name: "Created", type: "createdTime" }],
};

async function api(path, body) {
  const res = await fetch(`https://api.airtable.com/v0/meta/${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`${res.status} ${JSON.stringify(json)}`);
  return json;
}

const base = await api("bases", {
  name: "BVF 2027 Applications",
  workspaceId: WORKSPACE,
  tables: [applications, reviews, nominations],
});

const appTable = base.tables.find((t) => t.name === "Applications");
const revTable = base.tables.find((t) => t.name === "Reviews");

// Applications get a "Record ID" formula; Reviews link to Applications and look
// that ID up, so the app can filter reviews by application.
const recordIdField = await api(`bases/${base.id}/tables/${appTable.id}/fields`, {
  name: "Record ID",
  type: "formula",
  options: { formula: "RECORD_ID()" },
});
const linkField = await api(`bases/${base.id}/tables/${revTable.id}/fields`, {
  name: "Application",
  type: "multipleRecordLinks",
  options: { linkedTableId: appTable.id },
});
await api(`bases/${base.id}/tables/${revTable.id}/fields`, {
  name: "Application ID",
  type: "multipleLookupValues",
  options: { recordLinkFieldId: linkField.id, fieldIdForLinkedTable: recordIdField.id },
});

console.log("\nBase created: " + base.id);
console.log("Add this to your environment:\n\n  AIRTABLE_BASE_ID=" + base.id + "\n");
console.log("Open it at https://airtable.com/" + base.id);
