"use client";

import { useState } from "react";

export function NominateForm({ compact = true }: { compact?: boolean }) {
  const [founder, setFounder] = useState("");
  const [link, setLink] = useState("");
  const [nominator, setNominator] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!founder.trim()) return;
    setState("sending");
    const res = await fetch("/api/nominations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ founder, link, nominator }),
    });
    setState(res.ok ? "done" : "error");
  }

  if (state === "done") {
    return <p className="notice">Thank you. The Foundation will reach out to them directly.</p>;
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      <label htmlFor="nom-founder" className="sr-only" style={srOnly}>Founder&apos;s name</label>
      <input id="nom-founder" value={founder} onChange={(e) => setFounder(e.target.value)} placeholder="Founder's name" required style={{ flex: "1 1 160px" }} />
      <label htmlFor="nom-link" style={srOnly}>Company or LinkedIn profile</label>
      <input id="nom-link" value={link} onChange={(e) => setLink(e.target.value)} placeholder="Company or LinkedIn profile" style={{ flex: "1 1 160px" }} />
      {!compact && (
        <>
          <label htmlFor="nom-you" style={srOnly}>Your name and email (optional)</label>
          <input id="nom-you" value={nominator} onChange={(e) => setNominator(e.target.value)} placeholder="Your name and email (optional)" style={{ flex: "1 1 100%" }} />
        </>
      )}
      <button type="submit" className="btn btn-ink" style={{ height: 48 }} disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : "Submit"}
      </button>
      {state === "error" && <p className="error" style={{ flexBasis: "100%" }}>Something went wrong. Please try again.</p>}
    </form>
  );
}

const srOnly: React.CSSProperties = { position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" };
