"use client";

import { useRef, useState } from "react";
import type { Review } from "@/lib/review-data";
import type { Reviewer } from "@/lib/auth";
import { Scorecard } from "./Scorecard";

interface Props {
  appId: string;
  me: Reviewer;
  initialReviews: Review[];
  initialPrepNotes: string;
  initialInterviewTime: string;
  initialDecisionNotes: string;
}

// Right-hand column of the interview page: this reviewer's scorecard and the
// shared notes/logistics. Other reviewers' scores are deliberately not shown
// during the call; they come together on the Select page.
export function LiveInterview({ appId, me, initialReviews, initialPrepNotes, initialInterviewTime, initialDecisionNotes }: Props) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [prep, setPrep] = useState(initialPrepNotes);
  const [when, setWhen] = useState(initialInterviewTime ? toLocalInput(initialInterviewTime) : "");
  const [decisionNotes, setDecisionNotes] = useState(initialDecisionNotes);
  const [tab, setTab] = useState<"score" | "notes">("score");
  const prepTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const decTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function patch(fields: Record<string, string>) {
    return fetch(`/api/review/applications/${appId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(fields) });
  }
  function onPrep(v: string) {
    setPrep(v);
    if (prepTimer.current) clearTimeout(prepTimer.current);
    prepTimer.current = setTimeout(() => patch({ "Prep Notes": v }), 1000);
  }
  function onDecisionNotes(v: string) {
    setDecisionNotes(v);
    if (decTimer.current) clearTimeout(decTimer.current);
    decTimer.current = setTimeout(() => patch({ "Decision Notes": v }), 1000);
  }

  const interviewReviews = reviews.filter((r) => r.stage === "Interview");
  const mine = interviewReviews.find((r) => r.reviewer === me.email);

  return (
    <div className="live-panel">
      <div className="box" style={{ gap: 16 }}>
        <div className="seg-tabs" role="tablist">
          <button type="button" role="tab" aria-selected={tab === "score"} className={tab === "score" ? "on" : ""} onClick={() => setTab("score")}>Score</button>
          <button type="button" role="tab" aria-selected={tab === "notes"} className={tab === "notes" ? "on" : ""} onClick={() => setTab("notes")}>Committee notes</button>
        </div>

        {tab === "score" ? (
          <Scorecard
            key={mine?.id || "new"}
            appId={appId}
            stage="Interview"
            mine={mine}
            firstName={me.name.split(" ")[0]}
            frameless
            onSaved={(r) => setReviews((prev) => [...prev.filter((x) => x.id !== r.id), r])}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="field">
              <label htmlFor="when">Interview time</label>
              <input id="when" type="datetime-local" value={when} onChange={(e) => { setWhen(e.target.value); if (e.target.value) patch({ "Interview Time": new Date(e.target.value).toISOString() }); }} style={{ height: 40 }} />
            </div>
            <div className="field">
              <label htmlFor="prep">Prep notes (shared)</label>
              <textarea id="prep" value={prep} onChange={(e) => onPrep(e.target.value)} rows={6} placeholder="What the financials showed, cap-table notes, specific questions to ask this founder." />
            </div>
            <div className="field">
              <label htmlFor="dnotes">Decision notes (shared)</label>
              <textarea id="dnotes" value={decisionNotes} onChange={(e) => onDecisionNotes(e.target.value)} rows={4} placeholder="Terms to propose, open questions, next steps." />
            </div>
            <span className="saving">Saves automatically; visible to all three reviewers.</span>
          </div>
        )}
      </div>

    </div>
  );
}

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
