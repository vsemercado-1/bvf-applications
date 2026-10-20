"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { StatusPill, fmt, daysAgo } from "./StatusPill";
import { Avatar } from "@/components/Avatar";

export interface Row {
  id: string;
  name: string;
  photo?: string;
  company: string;
  oneLiner: string;
  region: string;
  status: string;
  submittedAt?: string;
  raising: string;
  termsOk: string;
  myScore: number | null;
  myRec?: string;
  avg: number | null;
  reviewerCount: number;
}

const FILTERS = ["To review", "Submitted", "Finalist", "Not yet", "Screened out", "Selected", "All"] as const;

export function ApplicationsTable({ rows }: { rows: Row[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("To review");
  const [sort, setSort] = useState<"newest" | "score">("newest");

  const shown = useMemo(() => {
    let r = rows;
    if (filter === "To review") r = rows.filter((x) => x.status === "Submitted" && x.myScore === null);
    else if (filter !== "All") r = rows.filter((x) => x.status === filter);
    return [...r].sort((a, b) => {
      if (sort === "score") return (b.avg ?? -1) - (a.avg ?? -1);
      return (b.submittedAt || "").localeCompare(a.submittedAt || "");
    });
  }, [rows, filter, sort]);

  return (
    <div>
      <div className="filters" role="group" aria-label="Filter applications">
        {FILTERS.map((f) => (
          <button key={f} className={filter === f ? "on" : ""} onClick={() => setFilter(f)}>
            {f}
            {f === "To review" && ` (${rows.filter((x) => x.status === "Submitted" && x.myScore === null).length})`}
          </button>
        ))}
        <span style={{ flex: 1 }} />
        <button className={sort === "newest" ? "on" : ""} onClick={() => setSort("newest")}>Newest</button>
        <button className={sort === "score" ? "on" : ""} onClick={() => setSort("score")}>Highest score</button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table className="table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Founder</th>
              <th>Region</th>
              <th>Raising</th>
              <th>Terms</th>
              <th>My score</th>
              <th>Avg</th>
              <th>Status</th>
              <th>Submitted</th>
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 && (
              <tr><td colSpan={9} className="muted" style={{ padding: 32, textAlign: "center" }}>Nothing here.</td></tr>
            )}
            {shown.map((r) => (
              <tr key={r.id}>
                <td>
                  <Link href={`/review/${r.id}`}>{r.company || "(no company)"}</Link>
                  <div className="muted small" style={{ maxWidth: 360 }}>{r.oneLiner}</div>
                </td>
                <td><span style={{ display: "flex", alignItems: "center", gap: 8 }}><Avatar src={r.photo} name={r.name} size={28} />{r.name}</span></td>
                <td className="small">{r.region}</td>
                <td className="small">{r.raising.replace("In the next 6 months", "≤6 mo").replace("Not right now", "No").replace("Raising now", "Now")}</td>
                <td className="small">{r.termsOk}</td>
                <td>
                  {fmt(r.myScore)}
                  {r.myRec && <div className="muted small">{r.myRec}</div>}
                </td>
                <td>
                  {fmt(r.avg)}
                  {r.reviewerCount > 0 && <div className="muted small">{r.reviewerCount} of 3</div>}
                </td>
                <td><StatusPill status={r.status} /></td>
                <td className="small muted">{daysAgo(r.submittedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
