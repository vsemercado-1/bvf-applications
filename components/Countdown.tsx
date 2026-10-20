"use client";

import { useEffect, useState } from "react";

// Deadline is 11:59 PM Pacific on NEXT_PUBLIC_DEADLINE. Pacific is UTC-8 in January.
function deadlineDate(raw: string): Date {
  return new Date(`${raw}T23:59:59-08:00`);
}

function parts(now: Date, end: Date) {
  if (end <= now) return null;
  // Count whole months first, then days/hours/minutes from the remainder.
  let months = 0;
  const cursor = new Date(now);
  while (true) {
    const next = new Date(cursor);
    next.setMonth(next.getMonth() + 1);
    if (next > end) break;
    cursor.setTime(next.getTime());
    months++;
  }
  let ms = end.getTime() - cursor.getTime();
  const days = Math.floor(ms / 86400000); ms -= days * 86400000;
  const hours = Math.floor(ms / 3600000); ms -= hours * 3600000;
  const minutes = Math.floor(ms / 60000);
  return { months, days, hours, minutes };
}

type Parts = { months: number; days: number; hours: number; minutes: number } | null;

export function Countdown({ deadline }: { deadline: string }) {
  const [p, setP] = useState<Parts | undefined>(undefined);

  useEffect(() => {
    const tick = () => setP(parts(new Date(), deadlineDate(deadline)));
    tick();
    const t = setInterval(tick, 30000);
    return () => clearInterval(t);
  }, [deadline]);

  if (p === undefined) return <span className="countdown" />;
  if (p === null) return <span className="countdown">Applications are closed</span>;

  const units: [number, string][] = [];
  if (p.months) units.push([p.months, "month"]);
  units.push([p.days, "day"], [p.hours, "hour"], [p.minutes, "minute"]);

  return (
    <span className="countdown">
      {units.map(([n, w], i) => (
        <span key={w}>
          {i > 0 && " "}
          <b>{n}</b>
          <span className="unit">{w}{n === 1 ? "" : "s"}</span>
        </span>
      ))}
      <span className="unit"> left</span>
    </span>
  );
}
