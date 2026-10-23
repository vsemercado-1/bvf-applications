"use client";

import { useEffect, useRef, useState } from "react";
import type { Review } from "@/lib/review-data";
import { reviewAverage } from "@/lib/review-data";
import type { Reviewer } from "@/lib/auth";
import { Scorecard } from "./Scorecard";
import { fmt } from "./StatusPill";

interface Props {
  appId: string;
  me: Reviewer;
  reviewers: { email: string; name: string }[];
  initialReviews: Review[];
  initialPrepNotes: string;
  initialInterviewTime: string;
  initialDecisionNotes: string;
}

// Right-hand column of the interview page: the committee strip (everyone's
// running average and call, refreshed every few seconds), this reviewer's
// live scorecard, and shared notes/logistics.
export function LiveInterview({ appId, me, reviewers, initialReviews, initialPrepNotes, initialInterviewTime, initialDecisionNotes }: Props) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [prep, setPrep] = useState(initialPrepNotes);
  const [when, setWhen] = useState(initialInterviewTime ? toLocalInput(initialInterviewTime) : "");
  const [decisionNotes, setDecisionNotes] = useState(initialDecisionNotes);
  const [live, setLive] = useState(true);
  const [tab, setTab] = useState<"score" | "notes">("score");
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
  const avgs = interviewReviews.map(reviewAverage).filter((v): v is number => v !== null);
  const committeeAvg = avgs.length ? avgs.reduce((a, b) => a + b, 0) / avgs.length : null;

  return (
    <div className="live-panel">
      <div className="committee-strip">
        <div className="committee-head">
          <span className="eyebrow" style={{ color: "var(--accent-on-dark)" }}>Committee · live</span>
          <label className="small" style={{ display: "flex", gap: 6, alignItems: "center", color: "var(--on-dark-muted)" }}>
            <input type="checkbox" checked={live} onChange={(e) => setLive(e.target.checked)} style={{ width: "auto", height: "auto" }} />
            auto-refresh
          </label>
        </div>
        <div className="committee-row">
          {reviewers.map((rv) => {
            const r = interviewReviews.find((x) => x.reviewer === rv.email);
            const avg = r ? reviewAverage(r) : null;
            const first = rv.name.split(" ")[0];
            return (
              <div key={rv.email} className={`committee-person ${rv.email === me.email ? "me" : ""}`}>
                <span className="committee-avatar">{first[0]}</span>
                <span className="committee-name">{first}{rv.email === me.email ? " (you)" : ""}</span>
                <span className={`committee-avg ${avg === null ? "empty" : ""}`}>{fmt(avg)}</span>
                <span className={`committee-call ${(r?.decision || "").toLowerCase()}`}>{r?.decision || "—"}</span>
              </div>
            );
          })}
          <div className="committee-person total">
            <span className="committee-name">Average</span>
            <span className={`committee-avg ${committeeAvg === null ? "empty" : ""}`} style={{ fontSize: 30 }}>{fmt(committeeAvg)}</span>
          </div>
        </div>
      </div>

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

      {interviewReviews.some((r) => r.notes && r.reviewer !== me.email) && (
        <div className="box" style={{ gap: 10 }}>
          <h3 style={{ margin: 0 }}>What the others are hearing</h3>
          {interviewReviews.filter((r) => r.notes && r.reviewer !== me.email).map((r) => (
            <div key={r.id} className="answer">
              <span className="q">{r.reviewerName.split(" ")[0]}&apos;s notes</span>
              <span className="a small">{r.notes}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
