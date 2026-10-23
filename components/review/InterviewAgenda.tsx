import { LANES } from "@/lib/schema";

export const LANE_COLOR: Record<string, string> = {
  strategy: "#0171cc",
  impact: "#1a9d55",
  finance: "#d98c00",
};

// The three areas the committee usually covers in 45 minutes, with sample
// questions. Not a script and not an order; anyone can pick up anything.
export function InterviewAgenda() {
  const lanes = Object.entries(LANES);
  return (
    <div className="lane-grid">
      {lanes.map(([key, lane]) => (
        <section key={key} className="lane-card" style={{ ["--lane" as string]: LANE_COLOR[key] || "var(--accent)" }}>
          <div className="lane-title">{lane.title}</div>
          <p className="small body" style={{ margin: 0 }}>{lane.goal}</p>
          <ul className="prompts">
            {lane.prompts.map((p) => <li key={p}>{p}</li>)}
          </ul>
        </section>
      ))}
    </div>
  );
}
