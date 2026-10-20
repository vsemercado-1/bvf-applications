import { SECTIONS, fill, ctxFrom, isVisible } from "@/lib/schema";
import type { AppFields } from "@/lib/review-data";

function Link_({ href }: { href?: string }) {
  if (!href) return <span className="muted">—</span>;
  const url = /^https?:\/\//i.test(href) ? href : `https://${href}`;
  return <a href={url} target="_blank" rel="noreferrer">{href.replace(/^https?:\/\//, "").slice(0, 60)}</a>;
}

// Read-only rendering of a full application, section by section.
export function ApplicationView({ f }: { f: AppFields }) {
  const ctx = ctxFrom(f);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div className="box">
        <h3>At a glance</h3>
        <dl className="kv">
          <dt>Founder</dt><dd>{f["Name"]} · {f["Role"]}</dd>
          <dt>Email</dt><dd><a href={`mailto:${f["Email"]}`}>{f["Email"]}</a></dd>
          <dt>LinkedIn</dt><dd><Link_ href={f["LinkedIn"]} /></dd>
          <dt>Region</dt><dd>{f["Region"]}</dd>
          <dt>Puerto Rico</dt><dd>{f["PR Connection"]}</dd>
          <dt>Website</dt><dd><Link_ href={f["Website"]} /></dd>
          <dt>Deck</dt><dd><Link_ href={f["Packet Deck"] || f["Deck URL"]} /></dd>
          <dt>Demo</dt><dd><Link_ href={f["Demo URL"]} /></dd>
          <dt>Investors</dt><dd>{f["Has Raised"] === "No" ? "None yet" : f["Investors"] || "—"}</dd>
          <dt>Raising</dt><dd>{f["Raising"]}{f["Raise Details"] ? ` — ${f["Raise Details"]}` : ""}</dd>
          <dt>Standard terms</dt><dd>{f["Terms OK"]}{f["Terms Notes"] ? ` — ${f["Terms Notes"]}` : ""}</dd>
          <dt>Heard from</dt><dd>{f["Heard From"] || "—"}</dd>
        </dl>
      </div>

      {SECTIONS.filter((s) => s.id !== "you").map((s) => (
        <div className="box" key={s.id}>
          <h3>{fill(s.title, ctx)}</h3>
          <div className="answers">
            {s.fields
              .filter((q) => !["Name", "Email", "LinkedIn", "Role", "PR Connection", "Website", "Deck URL", "Demo URL", "Heard From", "Raising", "Raise Details", "Terms OK", "Terms Notes", "Headshot", "Investors"].includes(q.key))
              .filter((q) => isVisible(q, f))
              .map((q) => (
                <div className="answer" key={q.key}>
                  <span className="q">{fill(q.label, ctx)}</span>
                  <span className="a">{f[q.key] || <span className="muted">—</span>}</span>
                </div>
              ))}
          </div>
        </div>
      ))}

      {(f["Packet Financials"] || f["Packet Cap Table"] || f["Packet Notes"]) && (
        <div className="box">
          <h3>Finalist materials</h3>
          <dl className="kv">
            <dt>Deck</dt><dd><Link_ href={f["Packet Deck"]} /></dd>
            <dt>Financials</dt><dd><Link_ href={f["Packet Financials"]} /></dd>
            <dt>Cap table</dt><dd><Link_ href={f["Packet Cap Table"]} /></dd>
            <dt>409A / FMV</dt><dd><Link_ href={f["Packet 409A"]} /></dd>
            {f["Packet Notes"] && (<><dt>Founder notes</dt><dd>{f["Packet Notes"]}</dd></>)}
          </dl>
        </div>
      )}
    </div>
  );
}
