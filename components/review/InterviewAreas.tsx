"use client";

import { useState } from "react";
import { LANES } from "@/lib/schema";

export const LANE_COLOR: Record<string, string> = {
  strategy: "#0171cc",
  impact: "#1a9d55",
  finance: "#d98c00",
};

export interface AreaOwner {
  lane: string;
  first: string;
  isMe: boolean;
}

// Three areas, each with the face of the reviewer who usually takes it.
// Sample questions stay hidden until someone asks for one.
export function InterviewAreas({ owners }: { owners: AreaOwner[] }) {
  const [shown, setShown] = useState<Record<string, number | null>>({});

  function next(lane: string) {
    const n = LANES[lane].prompts.length;
    setShown((s) => {
      const cur = s[lane];
      let i = Math.floor(Math.random() * n);
      if (cur != null && n > 1) while (i === cur) i = Math.floor(Math.random() * n);
      return { ...s, [lane]: i };
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {Object.entries(LANES).map(([key, lane]) => {
        const owner = owners.find((o) => o.lane === key);
        const i = shown[key];
        return (
          <section key={key} className={`area-card ${owner?.isMe ? "mine" : ""}`} style={{ ["--lane" as string]: LANE_COLOR[key] }}>
            <header>
              {owner && <span className="lane-avatar">{owner.first[0]}</span>}
              <div style={{ minWidth: 0 }}>
                <div className="lane-title">{lane.title}</div>
                {owner && <div className="small muted">{owner.first}{owner.isMe ? " (you)" : ""}</div>}
              </div>
              <button type="button" className="area-btn" onClick={() => next(key)}>{i == null ? "Need a question?" : "Another"}</button>
            </header>
            {i != null && <p className="area-q">{lane.prompts[i]}</p>}
          </section>
        );
      })}
    </div>
  );
}
