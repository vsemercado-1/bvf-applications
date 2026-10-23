"use client";

import { useEffect, useRef, useState } from "react";
import type { Review } from "@/lib/review-data";
import type { Reviewer } from "@/lib/auth";
import { Scorecard } from "./Scorecard";
import { OtherReviews } from "./OtherReviews";

interface Props {
  appId: string;
  me: Reviewer;
  reviewerNames: string[];
  initialReviews: Review[];
  initialPrepNotes: string;
  initialInterviewTime: string;
  initialDecisionNotes: string;
}

// The right-hand column of the interview page. Polls the server every few
// seconds so all three reviewers see each other's scores as they are entered.
export function LiveInterview({ appId, me, reviewerNames, initialReviews, initialPrepNotes, initialInterviewTime, initialDecisionNotes }: Props) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [prep, setPrep] = useState(initialPrepNotes);
  const [when, setWhen] = useState(initialInterviewTime ? toLocalInput(initialInterviewTime) : "");
  const [decisionNotes, setDecisionNotes] = useState(initialDecisionNotes);
  const [live, setLive] = useState(true);
  const prepTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const decTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!live) return;
    const t = setInterval(async () => {
      try {
        const res = await fetch(`/api/review/applications/${appId}`, { cache: "no-store" });
        if (res.ok) {
          const data = (await res.json()) as { reviews: Review[] };
          setReviews(data.reviews);
        }
      } catch {
        /* keep last known */
      }
    }, 4000);
    return () => clearInterval(t);
  }, [appId, live]);

  function patch(fields: Record<string, string>) {
    return fetch(`/api/review/applications/${appId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
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
      <Scorecard
        key={mine?.id || "new"}
        appId={appId}
        stage="Interview"
        mine={mine}
        firstName={me.name.split(" ")[0]}
        onSaved={(r) => setReviews((prev) => [...prev.filter((x) => x.id !== r.id), r])}
      />
      <OtherReviews reviews={reviews} stage="Interview" reviewerNames={reviewerNames} />
      <div className="box">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3>Committee decision notes</h3>
          <label className="small muted" style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input type="checkbox" checked={live} onChange={(e) => setLive(e.target.checked)} style={{ width: "auto", height: "auto" }} />
            Live updates
          </label>
        </div>
        <textarea value={decisionNotes} onChange={(e) => onDecisionNotes(e.target.value)} rows={4} placeholder="Shared notes for the committee: terms to propose, open questions, next steps." />
        <div className="field">
          <label htmlFor="when">Interview time</label>
          <input
            id="when"
            type="datetime-local"
            value={when}
            onChange={(e) => {
              setWhen(e.target.value);
              if (e.target.value) patch({ "Interview Time": new Date(e.target.value).toISOString() });
            }}
            style={{ height: 40 }}
          />
        </div>
      </div>
      <div className="box">
        <h3>Prep notes (shared)</h3>
        <textarea value={prep} onChange={(e) => onPrep(e.target.value)} rows={8} placeholder="Anything the committee should have in front of them: what the financials showed, cap-table notes, specific questions to ask." />
        <span className="saving">Saves automatically; visible to all three reviewers.</span>
      </div>
    </div>
  );
}

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
