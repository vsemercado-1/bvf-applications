"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { fmt } from "./StatusPill";
import { useSort, Th } from "./sortable";
import { recColor } from "./HomeList";
import type { AppRow } from "@/lib/stage";

interface Props {
  rows: AppRow[]; // still Submitted
  invited: AppRow[]; // Finalist / Interviewed / Selected / Declined
  screeners: { email: string; first: string }[];
}

// Decide mode of Home: both reviewers' scores, per-row "Invite to interview"
// that acts immediately (with undo), and a separate "Finish deciding" step.
export function DecideList({ rows: initialRows, invited: initialInvited, screeners }: Props) {
  const router = useRouter();
  const [rows, setRows] = useState(initialRows);
  const [invited, setInvited] = useState(initialInvited);
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<{ text: string; undo?: () => void } | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [confirmFinish, setConfirmFinish] = useState(false);
  const [finishing, setFinishing] = useState(false);

  const get = useCallback(
    (r: AppRow, k: string): string | number | null => {
      if (k === "company") return r.company || null;
      if (k === "name") return r.name || null;
      if (k === "avg") return r.screenAvg;
      if (k.startsWith("rv:")) return r.screen[k.slice(3)]?.avg ?? null;
      return null;
    },
    [],
  );
  const { sorted, key, dir, toggle } = useSort(rows, "avg", "desc", get);

  async function setStatus(id: string, status: "Finalist" | "Submitted") {
    setBusy(id);
    const res = await fetch(`/api/review/applications/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ Status: status }) });
    setBusy(null);
    return res.ok;
  }

  async function invite(r: AppRow) {
    setRows((rs) => rs.filter((x) => x.id !== r.id));
    setInvited((inv) => [{ ...r, status: "Finalist" }, ...inv]);
    const ok = await setStatus(r.id, "Finalist");
    if (!ok) return router.refresh();
    setToast({
      text: `${r.name} (${r.company}) invited to interview.`,
      undo: async () => {
        setToast(null);
        setInvited((inv) => inv.filter((x) => x.id !== r.id));
        setRows((rs) => [...rs, { ...r, status: "Submitted" }]);
        await setStatus(r.id, "Submitted");
      },
    });
    setTimeout(() => setToast((t) => (t?.text.startsWith(r.name) ? null : t)), 8000);
  }

  async function uninvite(r: AppRow) {
    if (r.status !== "Finalist") return; // don't pull back someone already interviewed
    setInvited((inv) => inv.filter((x) => x.id !== r.id));
    setRows((rs) => [...rs, { ...r, status: "Submitted" }]);
    await setStatus(r.id, "Submitted");
  }

  async function finish() {
    setFinishing(true);
    const res = await fetch("/api/review/advance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ closeRound: true }) });
    setFinishing(false);
    setConfirmFinish(false);
    if (res.ok) router.push("/review/interviews");
    else alert("Could not finish. Please try again.");
  }

  const head = (
    <tr>
      <Th id="name" label="Founder" sortKey={key} dir={dir} onSort={toggle} />
      <Th id="company" label="Company" sortKey={key} dir={dir} onSort={toggle} />
      {screeners.map((s) => <Th key={s.email} id={`rv:${s.email}`} label={s.first} sortKey={key} dir={dir} onSort={toggle} numeric />)}
      <Th id="avg" label="Average" sortKey={key} dir={dir} onSort={toggle} numeric />
      <th></th>
      <th style={{ textAlign: "right" }}></th>
    </tr>
  );

  const scoreCells = (r: AppRow) => (
    <>
      {screeners.map((s) => {
        const sc = r.screen[s.email];
        return (
          <td key={s.email}>
            {sc?.avg == null ? <span className="muted">—</span> : <><b>{fmt(sc.avg)}</b>{sc.rec && <div className="small" style={{ color: recColor(sc.rec), fontWeight: 600 }}>{sc.rec}</div>}</>}
          </td>
        );
      })}
      <td style={{ fontSize: 18, fontWeight: 800 }}>{fmt(r.screenAvg)}</td>
      <td className="small" style={{ whiteSpace: "nowrap" }}>
        {screeners.some((s) => r.screen[s.email]?.notes) && (
          <button type="button" className="link-btn" onClick={() => setOpen(open === r.id ? null : r.id)}>{open === r.id ? "Hide notes" : "Notes"}</button>
        )}
        <Link href={`/review/${r.id}`} className="muted" style={{ marginLeft: 12 }}>Edit my score</Link>
      </td>
    </>
  );

  const notesRow = (r: AppRow) =>
    open === r.id ? (
      <tr key={`${r.id}-n`}>
        <td></td>
        <td colSpan={4 + screeners.length}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "4px 0 8px" }}>
            {screeners.filter((s) => r.screen[s.email]?.notes).map((s) => (
              <div key={s.email} className="answer"><span className="q">{s.first}</span><span className="a small">{r.screen[s.email].notes}</span></div>
            ))}
          </div>
        </td>
      </tr>
    ) : null;

  const who = (r: AppRow, href: string) => (
    <>
      <td>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar src={r.photo} name={r.name} size={36} />
          <div><Link href={href} style={{ fontWeight: 700 }}>{r.name}</Link><div className="muted small">{r.region}</div></div>
        </div>
      </td>
      <td>{r.company}</td>
    </>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {toast && (
        <div className="toast">
          <span>{toast.text}</span>
          {toast.undo && <button type="button" className="link-btn" style={{ color: "#fff", fontWeight: 700 }} onClick={toast.undo}>Undo</button>}
        </div>
      )}

      <div className="box" style={{ gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ fontSize: 16, fontWeight: 800 }}>Still to decide · {rows.length}</div>
          <span className="small muted">Sorted by committee average. Inviting is immediate and can be undone; your own scores stay editable.</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>{head}</thead>
            <tbody>
              {sorted.length === 0 && <tr><td colSpan={5 + screeners.length} className="muted" style={{ textAlign: "center", padding: 28 }}>Everyone has been decided.</td></tr>}
              {sorted.map((r) => (
                <FragmentRows key={r.id}>
                  <tr>
                    {who(r, `/review/${r.id}`)}
                    {scoreCells(r)}
                    <td style={{ textAlign: "right" }}>
                      <button type="button" className="btn btn-accent btn-sm" style={{ height: 36 }} disabled={busy === r.id} onClick={() => invite(r)}>
                        Invite to interview
                      </button>
                    </td>
                  </tr>
                  {notesRow(r)}
                </FragmentRows>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length > 0 && (
          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 12, borderTop: "1px solid var(--line)", paddingTop: 14 }}>
            <span className="small muted">Done inviting?</span>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirmFinish(true)}>Finish deciding</button>
          </div>
        )}
        {confirmFinish && (
          <div className="box" style={{ borderColor: "var(--ink)" }}>
            <h3>Finish deciding?</h3>
            <p className="small body">
              The {rows.length} remaining application{rows.length === 1 ? "" : "s"} ({rows.map((r) => `${r.name}, ${r.company}`).join("; ")}) will be marked <b>Not selected</b>, and the public site will stop accepting applications. The {invited.length} you invited are unaffected. You can reopen from Round settings.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" className="btn btn-ink btn-sm" onClick={finish} disabled={finishing}>{finishing ? "Finishing…" : "Yes, finish"}</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirmFinish(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      <div className="box" style={{ gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ fontSize: 16, fontWeight: 800 }}>Invited to interview · {invited.length}</div>
          <Link href="/review/interviews" className="small" style={{ fontWeight: 600 }}>Go to Interviews →</Link>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>{head}</thead>
            <tbody>
              {invited.length === 0 && <tr><td colSpan={5 + screeners.length} className="muted" style={{ textAlign: "center", padding: 28 }}>No one yet. Invite from the list above.</td></tr>}
              {[...invited].sort((a, b) => (b.screenAvg ?? -1) - (a.screenAvg ?? -1)).map((r) => (
                <FragmentRows key={r.id}>
                  <tr style={{ background: "var(--accent-tint)" }}>
                    {who(r, `/review/${r.id}`)}
                    {scoreCells(r)}
                    <td style={{ textAlign: "right" }}>
                      {r.status === "Finalist" ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                          <span className="small" style={{ fontWeight: 700, color: "#116b2b" }}>Invited ✓</span>
                          <button type="button" className="link-btn small muted" onClick={() => uninvite(r)}>Undo</button>
                        </span>
                      ) : (
                        <span className={`pill ${r.status.toLowerCase().replace(/\s+/g, "-")}`}>{r.status}</span>
                      )}
                    </td>
                  </tr>
                  {notesRow(r)}
                </FragmentRows>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FragmentRows({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
