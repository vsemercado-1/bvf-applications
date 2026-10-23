import Link from "next/link";
import { STAGES, stageIndex, type StageId } from "@/lib/stage";

// Where each stage lives. Every stage is a link, so the bar works as
// navigation as well as progress: you can always go back to look or edit.
const HREF: Record<StageId, string> = {
  open: "/review/settings",
  screen: "/review?view=screen",
  decide: "/review?view=decide",
  interview: "/review/interviews",
  select: "/review/select",
  announce: "/review/select",
};

export function StageBar({ current, counts, viewing }: { current: StageId; counts: Record<StageId, string>; viewing?: StageId }) {
  const cur = stageIndex(current);
  const pct = (cur / (STAGES.length - 1)) * 100;
  const view = viewing ?? current;
  return (
    <nav className="stagebar" aria-label="Round stages">
      <div className="stagebar-track" aria-hidden="true" />
      <div className="stagebar-fill" aria-hidden="true" style={{ width: `calc(${pct}% * (1 - 2 * ${1 / (STAGES.length * 2)}))` }} />
      {STAGES.map((s, i) => {
        const state = i < cur ? "done" : i === cur ? "on" : "todo";
        const here = s.id === view;
        return (
          <Link key={s.id} href={HREF[s.id]} className={`stage ${state}${here ? " here" : ""}`} aria-current={here ? "page" : undefined}>
            <div className="stage-dot">{state === "done" ? "✓" : i + 1}</div>
            <div className="stage-label">{s.label}</div>
            <div className="stage-count">{counts[s.id]}</div>
          </Link>
        );
      })}
    </nav>
  );
}
