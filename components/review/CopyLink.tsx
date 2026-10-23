"use client";

import { useState } from "react";

export function CopyLink({ url, label, className }: { url: string; label: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={className || "chip"}
      style={{ cursor: "pointer" }}
      onClick={async () => {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? "Copied ✓" : label}
    </button>
  );
}
