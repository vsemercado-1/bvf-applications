import { getSettings } from "@/lib/settings";
import { SettingsForm } from "@/components/review/SettingsForm";
import { StageBar } from "@/components/review/StageBar";
import { getRoundState } from "@/lib/stage";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [s, st] = await Promise.all([getSettings(), getRoundState()]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="box" style={{ padding: "22px 24px", marginBottom: 12 }}>
        <StageBar current={st.current} counts={st.counts} viewing="open" />
      </div>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Open: round settings</h1>
      <p className="muted small">Changes take effect on the public site immediately.</p>
      <div style={{ maxWidth: 640, display: "flex", flexDirection: "column", gap: 12 }}>
        <SettingsForm initial={s} />
        <p className="small muted">Finishing the Decide step closes applications automatically; use the switch above to reopen or to close early.</p>
      </div>
    </div>
  );
}
