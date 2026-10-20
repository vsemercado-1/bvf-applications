import { getSettings } from "@/lib/settings";
import { SettingsForm } from "@/components/review/SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const s = await getSettings();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 640 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Settings</h1>
      <p className="muted small">Changes take effect on the public site immediately.</p>
      <SettingsForm initial={s} />
      <div className="box" style={{ marginTop: 8 }}>
        <h3>Moving from screening to interviews</h3>
        <p className="small body">
          There is no separate switch. Open an application, set its stage to <b>Finalist</b>, and it appears on the Interviews tab with its materials link. Once you have your finalists, close applications here so no new ones arrive during interviews.
        </p>
      </div>
    </div>
  );
}
