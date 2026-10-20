import { listRecords, TABLES } from "@/lib/airtable";

export const dynamic = "force-dynamic";

export default async function NominationsPage() {
  const recs = await listRecords<Record<string, string>>(TABLES.nominations, {
    sort: [{ field: "Created", direction: "desc" }],
  });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Nominations</h1>
      <p className="muted small">{recs.length} founders referred through the site. Reach out and invite them to apply.</p>
      <table className="table">
        <thead>
          <tr><th>Founder</th><th>Company or LinkedIn</th><th>Nominated by</th><th>When</th></tr>
        </thead>
        <tbody>
          {recs.length === 0 && <tr><td colSpan={4} className="muted" style={{ textAlign: "center", padding: 32 }}>No nominations yet.</td></tr>}
          {recs.map((r) => (
            <tr key={r.id}>
              <td style={{ fontWeight: 600 }}>{r.fields["Founder Name"]}</td>
              <td>{linkify(r.fields["Company or LinkedIn"])}</td>
              <td>{r.fields["Nominator"] || <span className="muted">—</span>}</td>
              <td className="small muted">{new Date(r.createdTime).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function linkify(s?: string) {
  if (!s) return <span className="muted">—</span>;
  if (/^(https?:\/\/|www\.|[\w-]+\.(com|co|io|ai|org|net))/i.test(s)) {
    const href = /^https?:\/\//i.test(s) ? s : `https://${s}`;
    return <a href={href} target="_blank" rel="noreferrer">{s}</a>;
  }
  return s;
}
