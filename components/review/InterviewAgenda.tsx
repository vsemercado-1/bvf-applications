"use client";

import { useState } from "react";
import { LANES } from "@/lib/schema";

export interface AgendaReviewer {
  email: string;
  name: string;
  lane: string;
  isMe: boolean;
}

export const LANE_COLOR: Record<string, string> = {
  strategy: "#0171cc",
  impact: "#1a9d55",
  finance: "#d98c00",
};

// The 45 minutes, as a timeline the committee can follow during the call.
// Prompts are tickable so the person leading a lane can see what's been
// covered; ticks are local to this browser on purpose (no sync noise).
export function InterviewAgenda({ reviewers }: { reviewers: AgendaReviewer[] }) {
  const [asked, setAsked] = useState<Record<string, boolean>>({});
  const toggle = (k: string) => setAsked((a) => ({ ...a, [k]: !a[k] }));

  const laneMinutes = Math.floor(36 / Math.max(reviewers.length, 1));
  const segments = [
    { label: "Welcome", minutes: 5, color: "var(--ink)" },
    ...reviewers.map((r) => ({ label: r.name.split(" ")[0], minutes: laneMinutes, color: LANE_COLOR[r.lane] || "var(--accent)" })),
    { label: "Wrap", minutes: 45 - 5 - laneMinutes * reviewers.length, color: "var(--ink)" },
  ];
  let t = 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div className="agenda-bar">
          {segments.map((s) => {
            const start = t;
            t += s.minutes;
            return (
              <div key={s.label + start} className="agenda-seg" style={{ flex: s.minutes, background: s.color }} title={`${s.label}: ${start}–${t} min`}>
                <span>{s.label}</span>
                <small>{start}–{t}</small>
              </div>
            );
          })}
        </div>
        <p className="small muted" style={{ margin: "8px 0 0" }}>45 minutes. Each reviewer leads one lane; the others listen and score. Tap a question when it&apos;s been asked.</p>
      </div>

      <div className="lane-grid">
        {reviewers.map((r) => {
          const lane = LANES[r.lane];
          const color = LANE_COLOR[r.lane] || "var(--accent)";
          const first = r.name.split(" ")[0];
          const covered = lane.prompts.filter((p) => asked[`${r.lane}:${p}`]).length;
          return (
            <section key={r.email} className={`lane-card ${r.isMe ? "mine" : ""}`} style={{ ["--lane" as string]: color }}>
              <header>
                <span className="lane-avatar">{first[0]}</span>
                <div>
                  <div className="lane-title">{lane.title}</div>
                  <div className="small muted">{first}{r.isMe ? " · you lead this" : " leads"} · {covered}/{lane.prompts.length} asked</div>
                </div>
              </header>
              <p className="small body" style={{ margin: 0 }}>{lane.goal}</p>
              <ul className="prompts">
                {lane.prompts.map((p) => {
                  const k = `${r.lane}:${p}`;
                  return (
                    <li key={k} className={asked[k] ? "asked" : ""} onClick={() => toggle(k)}>
                      <span className="tick" aria-hidden="true">{asked[k] ? "✓" : ""}</span>
                      <span>{p}</span>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
