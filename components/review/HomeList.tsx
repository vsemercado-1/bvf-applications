"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { fmt } from "./StatusPill";
import { useSort, Th } from "./sortable";
import type { AppRow } from "@/lib/stage";

interface Props {
  toScore: AppRow[];
  scored: AppRow[];
  me: string;
  others: { email: string; first: string }[];
  total: number;
  mineDone: number;
}

// Screening mode of Home: every application, grouped into "to score" and
// "scored by you". Only this reviewer's scores are shown.
export function HomeList({ toScore, scored, me, others, total, mineDone }: Props) {
  const [showAll, setShowAll] = useState(false);
  const all = [...toScore, ...scored];

  const get = useCallback(
    (r: AppRow, k: string): string | number | null => {
      if (k === "company") return r.company || null;
      if (k === "name") return r.name || null;
      if (k === "investors") return r.investors || null;
      if (k === "raising") return r.raising || null;
      if (k === "mine") return r.screen[me]?.avg ?? null;
      if (k === "submitted") return r.submittedAt || null;
      return null;
    },
    [me],
  );
  const { sorted, key, dir, toggle } = useSort(all, "submitted", "desc", get);
  const pending = sorted.filter((r) => r.screen[me]?.avg == null);
  const done = sorted.filter((r) => r.screen[me]?.avg != null);
  const doneShown = showAll ? done : done.slice(0, 5);

  const head = (
    <tr>
      <Th id="company" label="Company" sortKey={key} dir={dir} onSort={toggle} />
      <Th id="name" label="Founder" sortKey={key} dir={dir} onSort={toggle} />
      <Th id="investors" label="Investors" sortKey={key} dir={dir} onSort={toggle} />
      <Th id="raising" label="Raising" sortKey={key} dir={dir} onSort={toggle} />
      {others.map((o) => <th key={o.email}>{o.first}</th>)}
      <Th id="mine" label="My score" sortKey={key} dir={dir} onSort={toggle} numeric style={{ textAlign: "right" }} />
    </tr>
  );

  const row = (r: AppRow) => {
    const mine = r.screen[me];
    return (
      <tr key={r.id}>
        <td>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar src={r.photo} name={r.name} size={36} />
            <div>
              <Link href={`/review/${r.id}`}>{r.company || "(no company)"}</Link>
              <div className="muted small">{r.region}</div>
            </div>
          </div>
        </td>
        <td>{r.name}</td>
        <td className="small" style={{ maxWidth: 220 }}>{r.investors || <span className="muted">None yet</span>}</td>
        <td className="small">{shortRaising(r.raising)}</td>
        {others.map((o) => (
          <td key={o.email} className="small muted">{r.screen[o.email]?.avg != null ? "✓" : "—"}</td>
        ))}
        <td style={{ textAlign: "right" }}>
          {mine?.avg == null ? (
            <Link href={`/review/${r.id}`} className="btn btn-ink btn-sm" style={{ height: 36 }}>Score →</Link>
          ) : (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
              <b style={{ fontSize: 16 }}>{fmt(mine.avg)}</b>
              <span className="small" style={{ fontWeight: 600, color: recColor(mine.rec) }}>{mine.rec || ""}</span>
              <Link href={`/review/${r.id}`} className="small muted">Edit</Link>
            </span>
          )}
        </td>
      </tr>
    );
  };

  return (
    <div className="box" style={{ gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div style={{ fontSize: 16, fontWeight: 800 }}>All {total} application{total === 1 ? "" : "s"}</div>
        <div style={{ display: "flex", gap: 16 }} className="small muted">
          <span><b style={{ color: "var(--ink)" }}>{total - mineDone}</b> to score</span>
          <span><b style={{ color: "var(--ink)" }}>{mineDone}</b> scored by you</span>
        </div>
      </div>

      {all.length === 0 && <p className="muted small" style={{ padding: "16px 0" }}>No applications yet.</p>}

      {pending.length > 0 && (
        <>
          <div className="eyebrow">To score · {pending.length}</div>
          <div style={{ overflowX: "auto" }}>
            <table className="table"><thead>{head}</thead><tbody>{pending.map(row)}</tbody></table>
          </div>
        </>
      )}

      {done.length > 0 && (
        <>
          <div className="eyebrow" style={{ color: "var(--muted)", marginTop: pending.length ? 8 : 0 }}>Scored by you · {done.length}</div>
          <div style={{ overflowX: "auto" }}>
            <table className="table"><thead>{head}</thead><tbody>{doneShown.map(row)}</tbody></table>
          </div>
          {done.length > 5 && (
            <button type="button" className="link-btn small" onClick={() => setShowAll(!showAll)}>{showAll ? "Show fewer" : `Show all ${done.length}`}</button>
          )}
        </>
      )}

      <p className="small muted" style={{ margin: 0 }}>Scores save as you go and can be edited any time until Decide. Only you can see yours.</p>
    </div>
  );
}

export function shortRaising(s: string) {
  return s.replace("In the next 6 months", "In 6 months").replace("Not right now", "Not now").replace("Raising now", "Now");
}
export function recColor(rec?: string) {
  if (rec === "Interview") return "#116b2b";
  if (rec === "Maybe") return "#9a5b00";
  if (rec === "Pass") return "var(--muted)";
  return "inherit";
}
