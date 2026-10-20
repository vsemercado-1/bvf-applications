import { redirect } from "next/navigation";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { ApplicationForm } from "@/components/ApplicationForm";
import { REGIONS } from "@/lib/schema";
import { getSettings } from "@/lib/settings";

export default async function ApplyPage({ searchParams }: { searchParams: Promise<{ region?: string }> }) {
  const { region } = await searchParams;
  if (!(await getSettings()).accepting) redirect("/#apply");
  const ok = region && (REGIONS as readonly string[]).includes(region) && region !== "Other";
  if (!ok) redirect("/#apply");

  return (
    <>
      <SiteHeader nav={false} />
      <main className="narrow" style={{ padding: "48px 24px 80px", display: "flex", flexDirection: "column", gap: 28 }}>
        <div className="eyebrow">2027 Cohort Application</div>
        <p className="body small" style={{ marginTop: -16 }}>
          Your answers save as you type. Close this tab and come back on this browser anytime; after the first step you&apos;ll also get a private link for other devices.
        </p>
        <ApplicationForm region={region!} />
      </main>
      <SiteFooter />
    </>
  );
}
