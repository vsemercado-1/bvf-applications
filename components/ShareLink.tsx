"use client";

import { useState } from "react";

// "Send them this page": uses the native share sheet on phones, copies the
// link everywhere else.
export function ShareLink({ url, className }: { url: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  async function go() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Bravo Venture Fellowship", url });
        return;
      } catch {
        /* user dismissed; fall through to copy */
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }
  return (
    <button type="button" className={className || "btn btn-ink"} onClick={go}>
      {copied ? "Link copied ✓" : "Copy the link"}
    </button>
  );
}
