"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { useSort, Th } from "./sortable";
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
  const filtered = useMemo(() => (hideScored ? rows.filter((r) => r.myScore === null) : rows), [rows, hideScored]);
  const get = useCallback((r: Row, k: string): string | number | null => {
    switch (k) {
      case "company": return r.company || null;
      case "name": return r.name || null;
      case "region": return r.region || null;
      case "investors": return r.investors || null;
      case "raising": return r.raising || null;
      case "myScore": return r.myScore;
      case "submitted": return r.submittedAt || null;
      default: return null;
    }
  }, []);
  const { sorted: shown, key, dir, toggle } = useSort(filtered, "submitted", "desc", get);
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
              <Th id="company" label="Company" sortKey={key} dir={dir} onSort={toggle} />
              <Th id="name" label="Founder" sortKey={key} dir={dir} onSort={toggle} />
              <Th id="region" label="Region" sortKey={key} dir={dir} onSort={toggle} />
              <Th id="investors" label="Investors" sortKey={key} dir={dir} onSort={toggle} />
              <Th id="raising" label="Raising" sortKey={key} dir={dir} onSort={toggle} />
              <Th id="myScore" label="My score" sortKey={key} dir={dir} onSort={toggle} numeric />
              <Th id="submitted" label="Submitted" sortKey={key} dir={dir} onSort={toggle} numeric />
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 && (
              <tr><td colSpan={7} className="muted" style={{ padding: 32, textAlign: "center" }}>{rows.length ? "You've scored everything." : "No applications yet."}</td></tr>
            )}
            {shown.map((r) => (
              <tr key={r.id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Avatar src={r.photo} name={r.name} size={40} />
                    <div>
                      <Link href={`/review/${r.id}`}>{r.company || "(no company)"}</Link>
                      <div className="muted small" style={{ maxWidth: 340 }}>{r.oneLiner}</div>
                    </div>
                  </div>
                </td>
                <td>{r.name}</td>
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
