import { redirect } from "next/navigation";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { ApplicationForm } from "@/components/ApplicationForm";
import { REGIONS } from "@/lib/schema";

export default async function ApplyPage({ searchParams }: { searchParams: Promise<{ region?: string }> }) {
  const { region } = await searchParams;
  const ok = region && (REGIONS as readonly string[]).includes(region) && region !== "Other";
  if (!ok) redirect("/#apply");

  return (
    <>
      <SiteHeader nav={false} />
      <main className="narrow" style={{ padding: "48px 24px 80px", display: "flex", flexDirection: "column", gap: 28 }}>
        <div className="eyebrow">2027 Cohort application · four short steps</div>
        <p className="body small" style={{ marginTop: -16 }}>
          Your answers save as you type, so you can close this tab and come back on this browser. After the first step you&apos;ll get a private link, in case you want to finish from another device.
        </p>
        <ApplicationForm region={region!} />
      </main>
      <SiteFooter />
    </>
  );
}
