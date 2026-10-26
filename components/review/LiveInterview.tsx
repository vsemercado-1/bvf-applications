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

// This reviewer's interview scorecard, plus shared notes tucked underneath.
// Other reviewers' scores are deliberately not shown during the call; they
// come together on the Select page.
export function LiveInterview({ appId, me, initialReviews, initialPrepNotes, initialInterviewTime, initialDecisionNotes }: Props) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [prep, setPrep] = useState(initialPrepNotes);
  const [when, setWhen] = useState(initialInterviewTime ? toLocalInput(initialInterviewTime) : "");
  const [decisionNotes, setDecisionNotes] = useState(initialDecisionNotes);
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

  const mine = reviews.find((r) => r.stage === "Interview" && r.reviewer === me.email);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="box" style={{ gap: 18, padding: "24px 26px" }}>
        <Scorecard
          key={mine?.id || "new"}
          appId={appId}
          stage="Interview"
          mine={mine}
          firstName={me.name.split(" ")[0]}
          frameless
          onSaved={(r) => setReviews((prev) => [...prev.filter((x) => x.id !== r.id), r])}
        />
      </div>

      <details className="box" style={{ gap: 0 }}>
        <summary style={{ cursor: "pointer", fontWeight: 700, fontSize: 14 }}>Shared notes &amp; interview time</summary>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 14 }}>
          <div className="field">
            <label htmlFor="when">Interview time</label>
            <input id="when" type="datetime-local" value={when} onChange={(e) => { setWhen(e.target.value); if (e.target.value) patch({ "Interview Time": new Date(e.target.value).toISOString() }); }} style={{ height: 40, maxWidth: 280 }} />
          </div>
          <div className="field">
            <label htmlFor="prep">Prep notes</label>
            <textarea id="prep" value={prep} onChange={(e) => onPrep(e.target.value)} rows={4} placeholder="Anything the committee should have in front of them." />
          </div>
          <div className="field">
            <label htmlFor="dnotes">Decision notes</label>
            <textarea id="dnotes" value={decisionNotes} onChange={(e) => onDecisionNotes(e.target.value)} rows={3} placeholder="Terms to propose, open questions, next steps." />
          </div>
          <span className="saving">Shared with all three reviewers; saves automatically.</span>
        </div>
      </details>
    </div>
  );
}

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
