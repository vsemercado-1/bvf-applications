import { getSettings } from "@/lib/settings";
import { SettingsForm } from "@/components/review/SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const s = await getSettings();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 640 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Round settings</h1>
      <p className="muted small">Changes take effect on the public site immediately.</p>
      <SettingsForm initial={s} />
      <p className="small muted">Finishing the Decide step closes applications automatically; use the switch above to reopen or to close early.</p>
    </div>
  );
}
