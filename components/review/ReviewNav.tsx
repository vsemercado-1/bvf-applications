"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { Reviewer } from "@/lib/auth";

export function ReviewNav({ reviewer }: { reviewer: Reviewer }) {
  const path = usePathname();
  const router = useRouter();
  const on = (p: string) => (path === p || (p !== "/review" && path.startsWith(p)) ? "on" : "");

  async function logout() {
    await fetch("/api/review/login", { method: "DELETE" });
    router.push("/review/login");
    router.refresh();
  }

  return (
    <div className="rv-header">
      <div className="wrap">
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <Link href="/review" style={{ color: "#fff", textDecoration: "none", fontWeight: 800, letterSpacing: "0.02em" }}>
            BVF <span style={{ color: "var(--accent)" }}>2027</span>
          </Link>
          <nav className="rv-nav" aria-label="Review">
            {reviewer.screens && <Link href="/review" className={on("/review")}>Applications</Link>}
            <Link href="/review/interviews" className={on("/review/interviews")}>Interviews</Link>
            <Link href="/review/nominations" className={on("/review/nominations")}>Nominations</Link>
          </nav>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 13, color: "var(--on-dark-body)" }}>
          <span>{reviewer.name}</span>
          <button onClick={logout} className="link-btn" style={{ color: "var(--on-dark-muted)" }}>Sign out</button>
        </div>
      </div>
    </div>
  );
}
