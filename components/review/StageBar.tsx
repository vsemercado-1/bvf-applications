import { STAGES, stageIndex, type StageId } from "@/lib/stage";

// The six-step lifecycle bar shown at the top of the committee pages.
export function StageBar({ current, counts }: { current: StageId; counts: Record<StageId, string> }) {
  const cur = stageIndex(current);
  const pct = (cur / (STAGES.length - 1)) * 100;
  return (
    <div className="stagebar">
      <div className="stagebar-track" aria-hidden="true" />
      <div className="stagebar-fill" aria-hidden="true" style={{ width: `calc(${pct}% * (1 - 2 * ${1 / (STAGES.length * 2)}))` }} />
      {STAGES.map((s, i) => {
        const state = i < cur ? "done" : i === cur ? "on" : "todo";
        return (
          <div key={s.id} className={`stage ${state}`} aria-current={state === "on" ? "step" : undefined}>
            <div className="stage-dot">{state === "done" ? "✓" : i + 1}</div>
            <div className="stage-label">{s.label}</div>
            <div className="stage-count">{counts[s.id]}</div>
          </div>
        );
      })}
    </div>
  );
}
