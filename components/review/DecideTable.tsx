"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useCallback, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { fmt } from "./StatusPill";
import { useSort, Th } from "./sortable";

export interface DecideRow {
  id: string;
  company: string;
  name: string;
  photo?: string;
  region: string;
  status: string;
  shortlist: boolean;
  per: { name: string; avg: number | null; rec?: string; notes?: string }[];
  avg: number | null;
  scoredBy: number;
}

// Decide: everyone's screening scores side by side. Tick rows to shortlist,
// then "Add to interviews". Can be repeated as often as needed; already
// advanced founders are listed underneath. "Close the round" is a separate,
// explicit step that marks the rest Not selected and closes applications.
export function DecideTable({ pending: initial, advanced, reviewerNames }: { pending: DecideRow[]; advanced: DecideRow[]; reviewerNames: string[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<"add" | "close" | null>(null);
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
  const waiting = rows.filter((r) => r.scoredBy < reviewerNames.length).length;

  async function toggleRow(id: string, on: boolean) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, shortlist: on } : r)));
    await fetch(`/api/review/applications/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ Shortlist: on }) });
  }

  async function run(closeRound: boolean) {
    setBusy(true);
    const res = await fetch("/api/review/advance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ closeRound }) });
    setBusy(false);
    setConfirm(null);
    if (!res.ok) {
      alert("Could not update. Please try again.");
      return;
    }
    if (closeRound) router.push("/review/interviews");
    else router.refresh();
  }

  const headerCells = (withCheckbox: boolean) => (
    <tr>
      {withCheckbox ? <Th id="shortlist" label="✓" sortKey={key} dir={dir} onSort={sortBy} numeric style={{ width: 40 }} /> : <th style={{ width: 40 }}></th>}
      <Th id="company" label="Company" sortKey={key} dir={dir} onSort={sortBy} />
      <Th id="name" label="Founder" sortKey={key} dir={dir} onSort={sortBy} />
      {reviewerNames.map((n) => <Th key={n} id={`rv:${n}`} label={n} sortKey={key} dir={dir} onSort={sortBy} numeric />)}
      <Th id="avg" label="Average" sortKey={key} dir={dir} onSort={sortBy} numeric />
      <th></th>
    </tr>
  );

  const renderRow = (r: DecideRow, selectable: boolean) => (
    <Fragment key={r.id}>
      <tr style={{ background: r.shortlist ? "var(--accent-tint)" : undefined }}>
        <td>
          {selectable ? (
            <input type="checkbox" checked={r.shortlist} onChange={(e) => toggleRow(r.id, e.target.checked)} aria-label={`Shortlist ${r.company}`} style={{ width: 18, height: 18 }} />
          ) : (
            <span className="pill finalist" style={{ fontSize: 11 }}>{r.status}</span>
          )}
        </td>
        <td>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar src={r.photo} name={r.name} size={36} />
            <div>
              <Link href={selectable ? `/review/${r.id}` : `/review/${r.id}/interview`}>{r.company}</Link>
              <div className="muted small">{r.region}</div>
            </div>
          </div>
        </td>
        <td>{r.name}</td>
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
        <tr>
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
    </Fragment>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>Decide</h1>
          <p className="muted small">
            {rows.length} still to decide · {waiting === 0 ? "everyone has scored" : `${waiting} waiting on a score`} · {advanced.length} already in interviews
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 22, fontWeight: 800 }}>{chosen.length}</span>
          <span className="small muted" style={{ lineHeight: 1.2 }}>selected</span>
          <button type="button" className="btn btn-ink btn-sm" disabled={chosen.length === 0} onClick={() => setConfirm("add")}>
            Add {chosen.length || ""} to interviews
          </button>
        </div>
      </div>

      {confirm === "add" && (
        <div className="box" style={{ borderColor: "var(--ink)" }}>
          <h3>Add {chosen.length} to interviews?</h3>
          <p className="small body">
            {chosen.map((c) => c.company).join(", ")} become Finalists and appear on the Interviews tab. Everyone else stays here, so you can add more later.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" className="btn btn-ink btn-sm" onClick={() => run(false)} disabled={busy}>{busy ? "Adding…" : "Yes, add them"}</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirm(null)}>Cancel</button>
          </div>
        </div>
      )}

      {confirm === "close" && (
        <div className="box" style={{ borderColor: "var(--ink)" }}>
          <h3>Close the round?</h3>
          <p className="small body">
            {chosen.length > 0 && <>{chosen.map((c) => c.company).join(", ")} will be added to interviews first. </>}
            The remaining {rows.length - chosen.length} applications are marked Not selected, and the public site stops accepting applications. You can still reopen from Settings or change any status from an interview page.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" className="btn btn-ink btn-sm" onClick={() => run(true)} disabled={busy}>{busy ? "Closing…" : "Yes, close the round"}</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirm(null)}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ overflowX: "auto" }}>
        <table className="table">
          <thead>{headerCells(true)}</thead>
          <tbody>
            {sorted.length === 0 && <tr><td colSpan={5 + reviewerNames.length} className="muted" style={{ textAlign: "center", padding: 32 }}>Nothing left to decide.</td></tr>}
            {sorted.map((r) => renderRow(r, true))}
          </tbody>
        </table>
      </div>

      {rows.length > 0 && (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirm("close")}>
            Close the round · mark the remaining {rows.length - chosen.length} Not selected
          </button>
        </div>
      )}

      {advanced.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800 }}>Already in interviews</h2>
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>{headerCells(false)}</thead>
              <tbody>{[...advanced].sort((a, b) => (b.avg ?? -1) - (a.avg ?? -1)).map((r) => renderRow(r, false))}</tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
