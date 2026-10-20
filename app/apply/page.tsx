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
        <div className="section-head">
          <div className="eyebrow">2027 Cohort</div>
          <h1 style={{ fontSize: 36, fontWeight: 800 }}>Application</h1>
          <p className="body">Four short sections. Responses are saved automatically as you go.</p>
        </div>
        <ApplicationForm region={region!} />
      </main>
      <SiteFooter />
    </>
  );
}
