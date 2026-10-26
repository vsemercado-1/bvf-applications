"use client";

import { useState } from "react";
import type { Review } from "@/lib/review-data";
import type { Reviewer } from "@/lib/auth";
import { Scorecard } from "./Scorecard";
import { ApplicationView } from "./ApplicationView";
import type { AppFields } from "@/lib/review-data";

interface Props {
  appId: string;
  me: Reviewer;
  initialReviews: Review[];
  fields: AppFields;
  first: string;
}

// This reviewer's interview scorecard, with the full application underneath.
// Other reviewers' scores are deliberately not shown during the call; they
// come together on the Select page.
export function LiveInterview({ appId, me, initialReviews, fields, first }: Props) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);

  const mine = reviews.find((r) => r.stage === "Interview" && r.reviewer === me.email);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="box" style={{ gap: 18, padding: "24px 26px" }}>
        <Scorecard
          key={mine?.id || "new"}
          appId={appId}
          stage="Interview"
          mine={mine}
          firstName={me.name.split(" ")[0]}
          frameless
          applicant={{ first, company: fields["Company"] || "" }}
          onSaved={(r) => setReviews((prev) => [...prev.filter((x) => x.id !== r.id), r])}
        />
      </div>

      <details className="box" style={{ gap: 0 }}>
        <summary style={{ cursor: "pointer", fontWeight: 700, fontSize: 14 }}>{first}&apos;s full application</summary>
        <div style={{ marginTop: 16 }}><ApplicationView f={fields} /></div>
      </details>
    </div>
  );
}

