export function DataError({ error }: { error: unknown }) {
  const msg = error instanceof Error ? error.message : String(error);
  return (
    <div className="box" style={{ borderColor: "#f5c2c0", background: "#fff7f7" }}>
      <h3>Could not load data from Airtable</h3>
      <p className="small body">
        Check that <code>AIRTABLE_TOKEN</code> and <code>AIRTABLE_BASE_ID</code> are set correctly in Vercel, that the token has access to the base, and that the table and field names match <code>scripts/setup-airtable.mjs</code>.
      </p>
      <pre className="small muted" style={{ whiteSpace: "pre-wrap", margin: 0 }}>{msg}</pre>
    </div>
  );
}
