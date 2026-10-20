"use client";

import { useEffect, useState } from "react";

// Deadline is 11:59 PM Pacific on NEXT_PUBLIC_DEADLINE. Pacific is UTC-8 in January.
function deadlineDate(): Date {
  const raw = process.env.NEXT_PUBLIC_DEADLINE || "2027-01-15";
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

const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;

export function Countdown() {
  const [text, setText] = useState<string>("");

  useEffect(() => {
    const tick = () => {
      const p = parts(new Date(), deadlineDate());
      if (!p) return setText("Applications are closed");
      const bits = [];
      if (p.months) bits.push(plural(p.months, "month"));
      bits.push(plural(p.days, "day"), plural(p.hours, "hour"), plural(p.minutes, "minute"));
      setText(`${bits.join(" ")} left`);
    };
    tick();
    const t = setInterval(tick, 30000);
    return () => clearInterval(t);
  }, []);

  return <span>{text}</span>;
}
