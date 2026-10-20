"use client";

import { useState } from "react";

export function ResumeForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "unavailable" | "error">("idle");
  const contact = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    const res = await fetch("/api/resume", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    if (res.status === 501) return setState("unavailable");
    setState(res.ok ? "sent" : "error");
  }

  if (state === "sent") {
    return <p className="notice">If there&apos;s a draft under {email}, a link is on its way. Check your spam folder if it doesn&apos;t arrive in a few minutes.</p>;
  }
  if (state === "unavailable") {
    return <p className="notice">We can&apos;t send links by email just yet. {contact ? <>Write to <a href={`mailto:${contact}`}>{contact}</a> and we&apos;ll send yours by hand.</> : "Please contact the Foundation and we'll send yours by hand."}</p>;
  }

  return (
    <form onSubmit={submit} className="panel" style={{ gap: 16 }}>
      <div className="field">
        <label htmlFor="resume-email">Email you applied with</label>
        <input id="resume-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
      </div>
      <div className="form-footer">
        <button type="submit" className="btn btn-ink" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Send my link"}</button>
        {state === "error" && <span className="error">Something went wrong. Please try again.</span>}
      </div>
    </form>
  );
}
