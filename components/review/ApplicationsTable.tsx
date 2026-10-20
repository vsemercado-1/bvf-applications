"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { fmt, daysAgo } from "./StatusPill";
import { Avatar } from "@/components/Avatar";

export interface Row {
  id: string;
  name: string;
  photo?: string;
  company: string;
  oneLiner: string;
  region: string;
  submittedAt?: string;
  investors: string;
  raising: string;
  myScore: number | null;
  myRec?: string;
}

// Screening list: every submitted application, with only *my* score. Other
// reviewers' scores are deliberately not shown here; they appear on Decide.
export function ApplicationsTable({ rows }: { rows: Row[] }) {
  const [hideScored, setHideScored] = useState(false);
  const shown = useMemo(() => (hideScored ? rows.filter((r) => r.myScore === null) : rows), [rows, hideScored]);
  const unscored = rows.filter((r) => r.myScore === null).length;

  return (
    <div>
      <div className="filters" style={{ justifyContent: "space-between" }}>
        <span className="small muted">
          {rows.length} submitted · {rows.length - unscored} scored by you · {unscored} to go
        </span>
        <label className="small" style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer" }}>
          <input type="checkbox" checked={hideScored} onChange={(e) => setHideScored(e.target.checked)} style={{ width: "auto", height: "auto" }} />
          Hide the ones I&apos;ve scored
        </label>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table className="table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Founder</th>
              <th>Region</th>
              <th>Investors</th>
              <th>Raising</th>
              <th>My score</th>
              <th>Submitted</th>
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 && (
              <tr><td colSpan={7} className="muted" style={{ padding: 32, textAlign: "center" }}>{rows.length ? "You've scored everything." : "No applications yet."}</td></tr>
            )}
            {shown.map((r) => (
              <tr key={r.id}>
                <td>
                  <Link href={`/review/${r.id}`}>{r.company || "(no company)"}</Link>
                  <div className="muted small" style={{ maxWidth: 360 }}>{r.oneLiner}</div>
                </td>
                <td><span style={{ display: "flex", alignItems: "center", gap: 8 }}><Avatar src={r.photo} name={r.name} size={28} />{r.name}</span></td>
                <td className="small">{r.region}</td>
                <td className="small" style={{ maxWidth: 220 }}>{r.investors || <span className="muted">None yet</span>}</td>
                <td className="small">{r.raising.replace("In the next 6 months", "≤6 mo").replace("Not right now", "No").replace("Raising now", "Now")}</td>
                <td>
                  {r.myScore === null ? <Link href={`/review/${r.id}`} className="pill" style={{ textDecoration: "none" }}>Score →</Link> : (
                    <>
                      <b>{fmt(r.myScore)}</b>
                      {r.myRec && <div className="muted small">{r.myRec}</div>}
                    </>
                  )}
                </td>
                <td className="small muted">{daysAgo(r.submittedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
