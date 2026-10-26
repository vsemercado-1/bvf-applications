"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// Inline scheduler for the Interviews list. Click the time to change it.
export function InterviewTimeCell({ appId, iso }: { appId: string; iso?: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(iso ? toLocalInput(iso) : "");
  const [busy, setBusy] = useState(false);

  async function save(v: string) {
    setBusy(true);
    await fetch(`/api/review/applications/${appId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ "Interview Time": v ? new Date(v).toISOString() : null }) });
    setBusy(false);
    setEditing(false);
    router.refresh();
  }

  if (editing) {
    return (
      <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
        <input type="datetime-local" value={value} onChange={(e) => setValue(e.target.value)} style={{ height: 34, fontSize: 13 }} autoFocus />
        <button type="button" className="btn btn-ink btn-sm" style={{ height: 34 }} disabled={busy} onClick={() => save(value)}>Save</button>
        <button type="button" className="link-btn small muted" onClick={() => setEditing(false)}>Cancel</button>
      </span>
    );
  }
  return (
    <button type="button" className="link-btn small" style={{ fontWeight: iso ? 600 : 400, color: iso ? "var(--ink)" : "var(--accent-ink)" }} onClick={() => setEditing(true)}>
      {iso ? formatTime(iso) : "Set time"}
    </button>
  );
}

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function formatTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}
