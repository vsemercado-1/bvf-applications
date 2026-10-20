"use client";

import { useEffect, useRef, useState } from "react";
import { SCORE_AXES, RECOMMENDATIONS, DECISIONS } from "@/lib/schema";
import type { Review } from "@/lib/review-data";

interface Props {
  appId: string;
  stage: "Screen" | "Interview";
  mine?: Review; // this reviewer's existing review, if any
  onSaved?: (r: Review) => void;
}

// Scores save on every click; notes save a second after you stop typing.
export function Scorecard({ appId, stage, mine, onSaved }: Props) {
  const [scores, setScores] = useState<Record<string, number | null>>(() => {
    const s: Record<string, number | null> = {};
    for (const a of SCORE_AXES) s[a.key] = mine?.scores[a.key] ?? null;
    return s;
  });
  const [notes, setNotes] = useState(mine?.notes || "");
  const [rec, setRec] = useState(mine?.recommendation || "");
  const [decision, setDecision] = useState(mine?.decision || "");
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const notesTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function persist(patch: Partial<{ scores: Record<string, number | null>; notes: string; recommendation: string; decision: string }>) {
    setState("saving");
    try {
      const res = await fetch("/api/review/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appId, stage, scores, notes, recommendation: rec, decision, ...patch }),
      });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { review: Review };
      setState("saved");
      onSaved?.(data.review);
    } catch {
      setState("error");
    }
  }

  function setScore(key: string, v: number) {
    const next = { ...scores, [key]: scores[key] === v ? null : v };
    setScores(next);
    persist({ scores: next });
  }

  useEffect(() => {
    if (notes === (mine?.notes || "") && state === "idle") return;
    if (notesTimer.current) clearTimeout(notesTimer.current);
    notesTimer.current = setTimeout(() => persist({ notes }), 1000);
    return () => {
      if (notesTimer.current) clearTimeout(notesTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes]);

  const vals = Object.values(scores).filter((v): v is number => typeof v === "number");
  const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;

  return (
    <div className="box">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h3>{stage === "Screen" ? "Your screening score" : "Your interview score"}</h3>
        <span style={{ fontSize: 22, fontWeight: 800 }}>{avg === null ? "—" : avg.toFixed(1)}</span>
      </div>
      {SCORE_AXES.map((a) => (
        <div className="axis" key={a.key}>
          <div className="lbl">
            <span>{a.label}</span>
          </div>
          <div className="scale" role="radiogroup" aria-label={a.label}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={scores[a.key] === n}
                className={scores[a.key] === n ? "on" : ""}
                onClick={() => setScore(a.key, n)}
              >
                {n}
              </button>
            ))}
          </div>
          <span className="anchor">{a.anchor}</span>
        </div>
      ))}

      {stage === "Screen" ? (
        <div className="field">
          <label htmlFor="rec">Recommendation</label>
          <div className="choices" style={{ gridTemplateColumns: "repeat(3, minmax(0,1fr))" }}>
            {RECOMMENDATIONS.map((r) => (
              <label key={r} className={`choice ${rec === r ? "on" : ""}`} style={{ minHeight: 42, fontSize: 14 }}>
                <input type="radio" name="rec" checked={rec === r} onChange={() => { setRec(r); persist({ recommendation: r }); }} />
                {r}
              </label>
            ))}
          </div>
        </div>
      ) : (
        <div className="field">
          <label htmlFor="dec">Your decision</label>
          <div className="choices" style={{ gridTemplateColumns: "repeat(3, minmax(0,1fr))" }}>
            {DECISIONS.map((d) => (
              <label key={d} className={`choice ${decision === d ? "on" : ""}`} style={{ minHeight: 42, fontSize: 14 }}>
                <input type="radio" name="dec" checked={decision === d} onChange={() => { setDecision(d); persist({ decision: d }); }} />
                {d}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="field">
        <label htmlFor="notes">Notes</label>
        <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} placeholder={stage === "Screen" ? "What stood out, what worries you, what you'd ask in an interview." : "What you heard. Keep typing; it saves as you go."} />
      </div>

      <span className="saving">
        {state === "saving" ? "Saving…" : state === "saved" ? "Saved" : state === "error" ? "Could not save — check your connection" : "Saves automatically"}
      </span>
    </div>
  );
}
