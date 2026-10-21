"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar } from "@/components/Avatar";
import { fmt } from "./StatusPill";
import type { AppRow } from "@/lib/stage";

interface Props {
  rows: AppRow[];
  reviewers: { email: string; first: string }[];
  canDecide: boolean;
}

// Final decision table: interview averages per reviewer, each reviewer's
// Select/Decline call, terms notes, and the committee's decision.
export function SelectList({ rows: initial, reviewers, canDecide }: Props) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);

  async function decide(r: AppRow, status: "Selected" | "Declined" | "Interviewed") {
    setBusy(r.id);
    setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, status } : x)));
    await fetch(`/api/review/applications/${r.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ Status: status }) });
    setBusy(null);
    router.refresh();
  }

  const sorted = [...rows].sort((a, b) => {
    const order = (s: string) => (s === "Selected" ? 0 : s === "Interviewed" ? 1 : s === "Finalist" ? 2 : 3);
    return order(a.status) - order(b.status) || (b.interviewAvg ?? -1) - (a.interviewAvg ?? -1);
  });

  return (
    <div className="box" style={{ gap: 16 }}>
      <div style={{ overflowX: "auto" }}>
        <table className="table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Screen avg</th>
              {reviewers.map((rv) => <th key={rv.email}>{rv.first}</th>)}
              <th>Interview avg</th>
              <th>Terms</th>
              <th style={{ textAlign: "right" }}>Decision</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && <tr><td colSpan={6 + reviewers.length} className="muted" style={{ textAlign: "center", padding: 28 }}>No finalists yet.</td></tr>}
            {sorted.map((r) => {
              const interviewed = r.status !== "Finalist";
              return (
                <tr key={r.id} style={{ background: r.status === "Selected" ? "#e6f7ea" : undefined, opacity: r.status === "Declined" ? 0.6 : 1 }}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <Avatar src={r.photo} name={r.name} size={36} />
                      <div>
                        <Link href={`/review/${r.id}/interview`}>{r.company}</Link>
                        <div className="muted small">{r.name} · {r.region}</div>
                      </div>
                    </div>
                  </td>
                  <td className="muted">{fmt(r.screenAvg)}</td>
                  {reviewers.map((rv) => {
                    const iv = r.interview[rv.email];
                    return (
                      <td key={rv.email}>
                        {iv?.avg == null ? <span className="muted">—</span> : <><b>{fmt(iv.avg)}</b>{iv.decision && <div className="small" style={{ fontWeight: 600, color: iv.decision === "Select" ? "#116b2b" : iv.decision === "Decline" ? "var(--muted)" : "#9a5b00" }}>{iv.decision}</div>}</>}
                      </td>
                    );
                  })}
                  <td style={{ fontSize: 18, fontWeight: 800 }}>{fmt(r.interviewAvg)}</td>
                  <td className="small" style={{ maxWidth: 220 }}>
                    {r.termsOk}{r.termsNotes && <div className="muted" title={r.termsNotes}>{r.termsNotes.slice(0, 80)}{r.termsNotes.length > 80 ? "…" : ""}</div>}
                  </td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    {!interviewed ? (
                      <span className="small muted">Not yet interviewed</span>
                    ) : !canDecide ? (
                      <span className={`pill ${r.status.toLowerCase()}`}>{r.status === "Interviewed" ? "Undecided" : r.status}</span>
                    ) : r.status === "Interviewed" ? (
                      <span style={{ display: "inline-flex", gap: 8 }}>
                        <button type="button" className="btn btn-ink btn-sm" style={{ height: 34 }} disabled={busy === r.id} onClick={() => decide(r, "Selected")}>Select</button>
                        <button type="button" className="btn btn-ghost btn-sm" style={{ height: 34 }} disabled={busy === r.id} onClick={() => decide(r, "Declined")}>Decline</button>
                      </span>
                    ) : (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                        <span className={`pill ${r.status.toLowerCase()}`}>{r.status}</span>
                        <button type="button" className="link-btn small muted" disabled={busy === r.id} onClick={() => decide(r, "Interviewed")}>Undo</button>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="small muted" style={{ margin: 0 }}>Decisions are the committee&apos;s record only; no one is notified by this page. Each reviewer&apos;s own call comes from the live scoring on the interview page.</p>
    </div>
  );
}
