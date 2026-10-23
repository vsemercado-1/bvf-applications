"use client";

import { useEffect, useRef, useState } from "react";
import { axesFor, RECOMMENDATIONS, DECISIONS } from "@/lib/schema";
import type { Review } from "@/lib/review-data";

interface Props {
  appId: string;
  stage: "Screen" | "Interview";
  mine?: Review; // this reviewer's existing review, if any
  onSaved?: (r: Review) => void;
  firstName?: string; // the signed-in reviewer, for the notes label
  frameless?: boolean; // interview page supplies its own card
}

// One reviewer's scorecard for one stage. Scores save on every click; notes
// save a second after you stop typing. The Interview stage uses different
// axes (lib/schema INTERVIEW_AXES) and a coloured "live" look.
export function Scorecard({ appId, stage, mine, onSaved, firstName, frameless }: Props) {
  const axes = axesFor(stage);
  const [scores, setScores] = useState<Record<string, number | null>>(() => {
    const s: Record<string, number | null> = {};
    for (const a of axes) s[a.key] = mine?.scores[a.key] ?? null;
    return s;
  });
  const [notes, setNotes] = useState(mine?.notes || "");
  const [rec, setRec] = useState(mine?.recommendation || "");
  const [decision, setDecision] = useState(mine?.decision || "");
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [confirmReset, setConfirmReset] = useState(false);
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

  async function reset() {
    setConfirmReset(false);
    const blank: Record<string, number | null> = {};
    for (const a of axes) blank[a.key] = null;
    setScores(blank);
    setNotes("");
    setRec("");
    setDecision("");
    setState("saving");
    try {
      const res = await fetch("/api/review/scores", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ appId, stage }) });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { review: Review };
      setState("saved");
      onSaved?.(data.review);
    } catch {
      setState("error");
    }
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
  const done = vals.length;
  const live = stage === "Interview";
  const anything = done > 0 || notes || rec || decision;

  const body = (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
        <div>
          <h3 style={{ margin: 0 }}>{live ? "Your live score" : "Your screening score"}</h3>
          <span className="small muted">{done} of {axes.length} answered</span>
        </div>
        <span className={`avg-badge ${avg === null ? "empty" : ""}`}>{avg === null ? "—" : avg.toFixed(1)}</span>
      </div>

      {axes.map((a, i) => (
        <div className={`axis ${live ? "axis-live" : ""}`} key={a.key}>
          <div className="lbl">
            <span>{live && <span className="axis-num">{i + 1}</span>}{a.label}</span>
            {scores[a.key] != null && <button type="button" className="link-btn small muted" onClick={() => setScore(a.key, scores[a.key] as number)}>clear</button>}
          </div>
          <span className="small body">{a.question}</span>
          <div className={`scale ${live ? "scale-live" : ""}`} role="radiogroup" aria-label={a.label}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={scores[a.key] === n}
                className={scores[a.key] === n ? "on" : scores[a.key] != null && n < (scores[a.key] as number) ? "below" : ""}
                onClick={() => setScore(a.key, n)}
              >
                {n}
              </button>
            ))}
          </div>
          <span className="anchor">
            <b>1</b> {a.anchors[1]} <b>3</b> {a.anchors[3]} <b>5</b> {a.anchors[5]}
          </span>
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
          <label htmlFor="dec">Your call</label>
          <div className="decide-row">
            {DECISIONS.map((d) => (
              <button key={d} type="button" className={`decide-btn ${d.toLowerCase()} ${decision === d ? "on" : ""}`} onClick={() => { setDecision(d); persist({ decision: d }); }}>
                {d === "Select" ? "✓ Select" : d === "Decline" ? "✕ Decline" : "? Undecided"}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="field">
        <label htmlFor="notes">{firstName ? `${firstName}'s notes` : "Your notes"}</label>
        <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} placeholder={stage === "Screen" ? "What stood out, what worries you, what you'd ask in an interview." : "What you heard. Keep typing; it saves as you go."} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <span className="saving">
          {state === "saving" ? "Saving…" : state === "saved" ? "Saved" : state === "error" ? "Could not save — check your connection" : "Saves automatically"}
          {stage === "Screen" ? " · private until Decide" : " · the committee sees this live"}
        </span>
        {anything && !confirmReset && (
          <button type="button" className="link-btn small muted" onClick={() => setConfirmReset(true)}>Reset my inputs</button>
        )}
      </div>
      {confirmReset && (
        <div className="box" style={{ borderColor: "var(--ink)", padding: 14, gap: 10 }}>
          <span className="small"><b>Clear everything you entered for this founder{live ? " in the interview" : ""}?</b> Scores, your {live ? "call" : "recommendation"}, and your notes. Other reviewers&apos; inputs are untouched.</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className="btn btn-ink btn-sm" onClick={reset}>Yes, reset</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirmReset(false)}>Cancel</button>
          </div>
        </div>
      )}
    </>
  );

  return frameless ? <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>{body}</div> : <div className="box">{body}</div>;
}
