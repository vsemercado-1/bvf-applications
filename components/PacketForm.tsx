"use client";

import { useState } from "react";

interface Initial { deck: string; financials: string; capTable: string; valuation: string; notes: string }

export function PacketForm({ token, initial, submittedAt }: { token: string; initial: Initial; submittedAt?: string }) {
  const [v, setV] = useState<Initial>(initial);
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">(submittedAt ? "done" : "idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("saving");
    const res = await fetch(`/api/packet/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(v),
    });
    setState(res.ok ? "done" : "error");
  }

  return (
    <form className="panel" onSubmit={submit}>
      {state === "done" && <p className="notice">Received. You can update these links at any time before your interview.</p>}
      <div className="field">
        <label htmlFor="deck">Pitch deck <span style={{ color: "var(--accent)" }}>*</span></label>
        <input id="deck" type="url" required value={v.deck} onChange={(e) => setV({ ...v, deck: e.target.value })} placeholder="https://" />
      </div>
      <div className="field">
        <label htmlFor="fin">Financials <span style={{ color: "var(--accent)" }}>*</span></label>
        <input id="fin" type="url" required value={v.financials} onChange={(e) => setV({ ...v, financials: e.target.value })} placeholder="https://" />
        <span className="help">The last twelve months of P&amp;L and current balance sheet, in whatever form you keep them.</span>
      </div>
      <div className="field">
        <label htmlFor="cap">Cap table <span style={{ color: "var(--accent)" }}>*</span></label>
        <input id="cap" type="url" required value={v.capTable} onChange={(e) => setV({ ...v, capTable: e.target.value })} placeholder="https://" />
        <span className="help">Including every outstanding SAFE and convertible note with its cap or discount, and any MFN, pro-rata, or similar rights those instruments carry.</span>
      </div>
      <div className="field">
        <label htmlFor="val">Most recent 409A valuation or board determination of fair market value <span className="muted" style={{ fontWeight: 400 }}>(optional)</span></label>
        <input id="val" type="url" value={v.valuation} onChange={(e) => setV({ ...v, valuation: e.target.value })} placeholder="https://" />
        <span className="help">The Fellowship includes a small purchase of common stock at fair market value. If you have a recent 409A, share it here; if not, leave this blank and we will discuss how to establish the price.</span>
      </div>
      <div className="field">
        <label htmlFor="notes">Anything the committee should know before the interview <span className="muted" style={{ fontWeight: 400 }}>(optional)</span></label>
        <textarea id="notes" value={v.notes} onChange={(e) => setV({ ...v, notes: e.target.value })} rows={3} />
      </div>
      <div className="form-footer">
        <button type="submit" className="btn btn-ink" disabled={state === "saving"}>
          {state === "saving" ? "Saving…" : state === "done" ? "Update" : "Submit"}
        </button>
        {state === "error" && <span className="error">Something went wrong. Please try again.</span>}
      </div>
    </form>
  );
}
