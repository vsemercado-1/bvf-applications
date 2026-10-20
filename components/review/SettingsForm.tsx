"use client";

import { useState } from "react";
import type { Settings } from "@/lib/settings";

export function SettingsForm({ initial }: { initial: Settings }) {
  const [accepting, setAccepting] = useState(initial.accepting);
  const [deadline, setDeadline] = useState(initial.deadline);
  const [closedMessage, setClosedMessage] = useState(initial.closedMessage);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function save(patch: Partial<Settings>) {
    setState("saving");
    const res = await fetch("/api/review/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
    setState(res.ok ? "saved" : "error");
  }

  return (
    <div className="box" style={{ gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <div>
          <div style={{ fontWeight: 700 }}>Applications are {accepting ? "open" : "closed"}</div>
          <div className="small muted">{accepting ? "Founders can start and submit applications." : "The site shows the closed message and the form is unavailable."}</div>
        </div>
        <button
          type="button"
          className={`btn btn-sm ${accepting ? "btn-ghost" : "btn-ink"}`}
          onClick={() => { const next = !accepting; setAccepting(next); save({ accepting: next }); }}
        >
          {accepting ? "Close applications" : "Open applications"}
        </button>
      </div>

      <div className="field">
        <label htmlFor="deadline">Deadline (closes 11:59 PM Pacific)</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input id="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} style={{ height: 44 }} />
          <button type="button" className="btn btn-ghost btn-sm" style={{ height: 44 }} onClick={() => save({ deadline })}>Save</button>
        </div>
        <span className="help">Shown in the countdown and the footer. After this date the site closes automatically.</span>
      </div>

      <div className="field">
        <label htmlFor="closed">Message shown when closed</label>
        <textarea id="closed" rows={2} value={closedMessage} onChange={(e) => setClosedMessage(e.target.value)} />
        <div><button type="button" className="btn btn-ghost btn-sm" onClick={() => save({ closedMessage })}>Save</button></div>
      </div>

      <span className="saving">{state === "saving" ? "Saving…" : state === "saved" ? "Saved" : state === "error" ? "Could not save" : ""}</span>
    </div>
  );
}
