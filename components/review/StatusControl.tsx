"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { STATUSES } from "@/lib/schema";

export function StatusControl({ appId, status, packetUrl }: { appId: string; status: string; packetUrl: string }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  async function change(next: string) {
    setValue(next);
    setBusy(true);
    await fetch(`/api/review/applications/${appId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Status: next }),
    });
    setBusy(false);
    router.refresh();
  }

  const finalist = ["Finalist", "Interviewed", "Selected", "Declined"].includes(value);

  return (
    <div className="box" style={{ gap: 12 }}>
      <h3 style={{ margin: 0 }}>Status &amp; materials</h3>
      <select value={value} onChange={(e) => change(e.target.value)} disabled={busy} aria-label="Application status">
        {STATUSES.filter((s) => ["Finalist", "Interviewed", "Selected", "Declined", "Not selected"].includes(s)).map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <p className="small muted" style={{ margin: 0 }}>Mark <b>Interviewed</b> after the call. Selected / Declined happen on the Select page.</p>
      {finalist && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span className="small" style={{ fontWeight: 600 }}>Materials link to send the founder</span>
          <div style={{ display: "flex", gap: 8 }}>
            <input readOnly value={packetUrl} style={{ height: 40, fontSize: 13 }} onFocus={(e) => e.target.select()} />
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={async () => {
                await navigator.clipboard.writeText(packetUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
