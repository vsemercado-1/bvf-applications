"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// One job: record that the interview happened. Select / Decline live on the
// Select page, and the materials link lives in the hero.
export function StatusControl({ appId, status }: { appId: string; status: string }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [busy, setBusy] = useState(false);

  async function change(next: string) {
    setValue(next);
    setBusy(true);
    await fetch(`/api/review/applications/${appId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ Status: next }) });
    setBusy(false);
    router.refresh();
  }

  if (value === "Finalist") {
    return (
      <div className="box" style={{ gap: 10 }}>
        <h3 style={{ margin: 0 }}>After the call</h3>
        <p className="small muted" style={{ margin: 0 }}>Mark the interview done so the Select step knows every finalist has been seen.</p>
        <button type="button" className="btn btn-ink btn-sm" disabled={busy} onClick={() => change("Interviewed")}>Mark as interviewed</button>
      </div>
    );
  }
  return (
    <div className="box" style={{ gap: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
      <span className="small"><b>{value === "Interviewed" ? "Interviewed ✓" : value}</b>{value === "Interviewed" && <span className="muted"> · decide on the Select page</span>}</span>
      {value === "Interviewed" && <button type="button" className="link-btn small muted" disabled={busy} onClick={() => change("Finalist")}>Undo</button>}
    </div>
  );
}
