import { SCORE_AXES } from "@/lib/schema";
import type { Review } from "@/lib/review-data";
import { reviewAverage } from "@/lib/review-data";
import { fmt } from "./StatusPill";

// Compact grid of every reviewer's scores for one stage, plus their notes.
export function OtherReviews({ reviews, stage, reviewerNames }: { reviews: Review[]; stage: "Screen" | "Interview"; reviewerNames: string[] }) {
  const rs = reviews.filter((r) => r.stage === stage);
  // Keep a stable column order: configured reviewers first.
  const cols = [...reviewerNames, ...rs.map((r) => r.reviewerName).filter((n) => !reviewerNames.includes(n))].slice(0, 3);
  const byName = Object.fromEntries(rs.map((r) => [r.reviewerName, r]));

  return (
    <div className="box">
      <h3>{stage === "Screen" ? "Committee screening scores" : "Committee interview scores"}</h3>
      <div className="score-grid" style={{ gridTemplateColumns: `minmax(0,1fr) repeat(${cols.length}, 72px)` }}>
        <span />
        {cols.map((c) => (
          <span key={c} className="h">{firstName(c)}</span>
        ))}
        {SCORE_AXES.map((a) => (
          <Fragment key={a.key}>
            <span className="small">{a.label}</span>
            {cols.map((c) => {
              const v = byName[c]?.scores[a.key];
              return <span key={c} className={`n ${v === undefined ? "empty" : ""}`}>{v ?? "·"}</span>;
            })}
          </Fragment>
        ))}
        <span className="small" style={{ fontWeight: 700 }}>Average</span>
        {cols.map((c) => (
          <span key={c} className="n" style={{ fontWeight: 800 }}>{fmt(byName[c] ? reviewAverage(byName[c]) : null)}</span>
        ))}
        <span className="small" style={{ fontWeight: 700 }}>{stage === "Screen" ? "Recommends" : "Decision"}</span>
        {cols.map((c) => (
          <span key={c} className="n small" style={{ fontWeight: 600 }}>{(stage === "Screen" ? byName[c]?.recommendation : byName[c]?.decision) || "·"}</span>
        ))}
      </div>
      {rs.filter((r) => r.notes).map((r) => (
        <div key={r.id} className="answer">
          <span className="q">{r.reviewerName}</span>
          <span className="a small">{r.notes}</span>
        </div>
      ))}
    </div>
  );
}

import { Fragment } from "react";

function firstName(n: string) {
  return n.split(" ")[0];
}
