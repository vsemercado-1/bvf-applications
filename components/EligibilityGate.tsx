"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { REGIONS } from "@/lib/schema";

export function EligibilityGate() {
  const router = useRouter();
  const [descent, setDescent] = useState<"Yes" | "No" | "">("");
  const [region, setRegion] = useState<string>("");
  const [err, setErr] = useState("");

  function go() {
    if (!descent || !region) {
      setErr("Please answer both questions.");
      return;
    }
    if (descent === "No" || region === "Other") {
      router.push(`/not-eligible?reason=${descent === "No" ? "descent" : "region"}`);
      return;
    }
    router.push(`/apply?region=${encodeURIComponent(region)}`);
  }

  return (
    <form
      className="panel"
      onSubmit={(e) => {
        e.preventDefault();
        go();
      }}
    >
      <fieldset className="field">
        <legend style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Are you of Puerto Rican descent?</legend>
        <div className="choices">
          {(["Yes", "No"] as const).map((v) => (
            <label key={v} className={`choice ${descent === v ? "on" : ""}`}>
              <input type="radio" name="descent" value={v} checked={descent === v} onChange={() => setDescent(v)} />
              {v}
            </label>
          ))}
        </div>
        <span className="help">
          Includes founders born in Puerto Rico, founders with Puerto Rican parents or grandparents, and founders raised in the diaspora.
        </span>
      </fieldset>

      <fieldset className="field">
        <legend style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Where do you currently live?</legend>
        <div className="choices">
          {REGIONS.map((r) => (
            <label key={r} className={`choice ${region === r ? "on" : ""}`}>
              <input type="radio" name="region" value={r} checked={region === r} onChange={() => setRegion(r)} />
              {r}
            </label>
          ))}
        </div>
      </fieldset>

      {err && <p className="error">{err}</p>}
      <button type="submit" className="btn btn-ink">Begin Application</button>
    </form>
  );
}
