// Thin client for the Airtable REST API. No SDK dependency.

const API = "https://api.airtable.com/v0";

export const TABLES = {
  applications: "Applications",
  reviews: "Reviews",
  nominations: "Nominations",
} as const;

export type Fields = Record<string, unknown>;
export interface Record_<T extends Fields = Fields> {
  id: string;
  createdTime: string;
  fields: T;
}

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing environment variable ${name}`);
  return v;
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}/${env("AIRTABLE_BASE_ID")}/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env("AIRTABLE_TOKEN")}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Airtable ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function listRecords<T extends Fields>(
  table: string,
  opts: { filterByFormula?: string; sort?: { field: string; direction?: "asc" | "desc" }[]; fields?: string[]; maxRecords?: number } = {},
): Promise<Record_<T>[]> {
  const out: Record_<T>[] = [];
  let offset: string | undefined;
  do {
    const params = new URLSearchParams();
    if (opts.filterByFormula) params.set("filterByFormula", opts.filterByFormula);
    if (opts.maxRecords) params.set("maxRecords", String(opts.maxRecords));
    opts.sort?.forEach((s, i) => {
      params.set(`sort[${i}][field]`, s.field);
      params.set(`sort[${i}][direction]`, s.direction || "asc");
    });
    opts.fields?.forEach((f) => params.append("fields[]", f));
    if (offset) params.set("offset", offset);
    const page = await call<{ records: Record_<T>[]; offset?: string }>(
      `${encodeURIComponent(table)}?${params.toString()}`,
    );
    out.push(...page.records);
    offset = page.offset;
  } while (offset);
  return out;
}

export async function getRecord<T extends Fields>(table: string, id: string): Promise<Record_<T>> {
  return call<Record_<T>>(`${encodeURIComponent(table)}/${id}`);
}

export async function createRecord<T extends Fields>(table: string, fields: T): Promise<Record_<T>> {
  const res = await call<{ records: Record_<T>[] }>(encodeURIComponent(table), {
    method: "POST",
    body: JSON.stringify({ records: [{ fields }], typecast: true }),
  });
  return res.records[0];
}

export async function updateRecord<T extends Fields>(table: string, id: string, fields: Partial<T>): Promise<Record_<T>> {
  const res = await call<{ records: Record_<T>[] }>(encodeURIComponent(table), {
    method: "PATCH",
    body: JSON.stringify({ records: [{ id, fields }], typecast: true }),
  });
  return res.records[0];
}

// Escape a string for use inside an Airtable formula string literal.
export function q(s: string): string {
  return `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}
