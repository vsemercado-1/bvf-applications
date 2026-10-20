"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useSort, Th } from "./sortable";
import { Avatar } from "@/components/Avatar";
import { fmt } from "./StatusPill";

export interface DecideRow {
  id: string;
  company: string;
  name: string;
  photo?: string;
  region: string;
  shortlist: boolean;
  per: { name: string; avg: number | null; rec?: string; notes?: string }[];
  avg: number | null;
  scoredBy: number;
}

// Decide: everyone's screening scores side by side, a shortlist checkbox per
// row, a running count, and one button to advance the shortlist to interviews.
export function DecideTable({ rows: initial, reviewerNames, alreadyAdvanced }: { rows: DecideRow[]; reviewerNames: string[]; alreadyAdvanced: number }) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  const get = useCallback((r: DecideRow, k: string): string | number | null => {
    if (k === "company") return r.company || null;
    if (k === "name") return r.name || null;
    if (k === "avg") return r.avg;
    if (k === "shortlist") return r.shortlist ? 1 : 0;
    if (k.startsWith("rv:")) return r.per.find((p) => p.name === k.slice(3))?.avg ?? null;
    return null;
  }, []);
  const { sorted, key, dir, toggle: sortBy } = useSort(rows, "avg", "desc", get);
  const chosen = rows.filter((r) => r.shortlist);
  const everyoneScored = rows.every((r) => r.scoredBy === reviewerNames.length);

  async function toggle(id: string, on: boolean) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, shortlist: on } : r)));
    await fetch(`/api/review/applications/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ Shortlist: on }) });
  }

  async function advance() {
    setBusy(true);
    const res = await fetch("/api/review/advance", { method: "POST" });
    setBusy(false);
    setConfirm(false);
    if (res.ok) router.push("/review/interviews");
    else alert("Could not advance. Please try again.");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>Decide</h1>
          <p className="muted small">
            {rows.length} applications · {everyoneScored ? "everyone has scored" : `${rows.filter((r) => r.scoredBy < reviewerNames.length).length} still waiting on a score`} · sorted by committee average
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 22, fontWeight: 800 }}>{chosen.length}</span>
          <span className="small muted" style={{ lineHeight: 1.2 }}>selected for<br />interviews</span>
          <button type="button" className="btn btn-ink btn-sm" disabled={chosen.length === 0 || rows.length === 0} onClick={() => setConfirm(true)}>
            Advance {chosen.length} to interviews
          </button>
        </div>
      </div>

      {alreadyAdvanced > 0 && <p className="notice small">{alreadyAdvanced} finalists have already been advanced. Advancing again adds to that group.</p>}

      {confirm && (
        <div className="box" style={{ borderColor: "var(--ink)" }}>
          <h3>Advance {chosen.length} to interviews?</h3>
          <p className="small body">
            {chosen.map((c) => c.company).join(", ")} become Finalists and appear on the Interviews tab. The other {rows.length - chosen.length} are marked Not selected. Applications close to new submissions. You can still change any individual status afterwards.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" className="btn btn-ink btn-sm" onClick={advance} disabled={busy}>{busy ? "Advancing…" : "Yes, advance"}</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ overflowX: "auto" }}>
        <table className="table">
          <thead>
            <tr>
              <Th id="shortlist" label="✓" sortKey={key} dir={dir} onSort={sortBy} numeric style={{ width: 40 }} />
              <Th id="company" label="Company" sortKey={key} dir={dir} onSort={sortBy} />
              <Th id="name" label="Founder" sortKey={key} dir={dir} onSort={sortBy} />
              {reviewerNames.map((n) => <Th key={n} id={`rv:${n}`} label={n} sortKey={key} dir={dir} onSort={sortBy} numeric />)}
              <Th id="avg" label="Average" sortKey={key} dir={dir} onSort={sortBy} numeric />
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && <tr><td colSpan={5 + reviewerNames.length} className="muted" style={{ textAlign: "center", padding: 32 }}>Nothing to decide yet.</td></tr>}
            {sorted.map((r) => (
              <>
                <tr key={r.id} style={{ background: r.shortlist ? "var(--accent-tint)" : undefined }}>
                  <td>
                    <input type="checkbox" checked={r.shortlist} onChange={(e) => toggle(r.id, e.target.checked)} aria-label={`Shortlist ${r.company}`} style={{ width: 18, height: 18 }} />
                  </td>
                  <td><Link href={`/review/${r.id}`}>{r.company}</Link><div className="muted small">{r.region}</div></td>
                  <td><span style={{ display: "flex", alignItems: "center", gap: 8 }}><Avatar src={r.photo} name={r.name} size={28} />{r.name}</span></td>
                  {r.per.map((p) => (
                    <td key={p.name}>
                      {p.avg === null ? <span className="muted">—</span> : <><b>{fmt(p.avg)}</b>{p.rec && <div className="small muted">{p.rec}</div>}</>}
                    </td>
                  ))}
                  <td style={{ fontSize: 18, fontWeight: 800 }}>{fmt(r.avg)}</td>
                  <td className="small">
                    {r.per.some((p) => p.notes) && (
                      <button type="button" className="link-btn" onClick={() => setOpen(open === r.id ? null : r.id)}>{open === r.id ? "Hide notes" : "Notes"}</button>
                    )}
                  </td>
                </tr>
                {open === r.id && (
                  <tr key={`${r.id}-notes`}>
                    <td></td>
                    <td colSpan={4 + reviewerNames.length}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "4px 0 8px" }}>
                        {r.per.filter((p) => p.notes).map((p) => (
                          <div key={p.name} className="answer"><span className="q">{p.name}</span><span className="a small">{p.notes}</span></div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
