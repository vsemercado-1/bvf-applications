import Link from "next/link";
import { redirect } from "next/navigation";
import { currentReviewer } from "@/lib/session";
import { getRoundState } from "@/lib/stage";
import { StageBar } from "@/components/review/StageBar";
import { SelectList } from "@/components/review/SelectList";
import { DataError } from "@/components/review/DataError";

export const dynamic = "force-dynamic";

export default async function SelectPage() {
  const me = await currentReviewer();
  if (!me) redirect("/review/login");
  let st;
  try {
    st = await getRoundState();
  } catch (e) {
    return <DataError error={e} />;
  }
  const candidates = [...st.finalists, ...st.decided];
  const selected = st.decided.filter((r) => r.status === "Selected").length;
  const pendingInterviews = st.finalists.filter((r) => r.status === "Finalist").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div className="eyebrow">2027 Cohort</div>
          <h1 style={{ fontSize: 30, fontWeight: 800, marginTop: 6 }}>Select the Fellows</h1>
          <p className="body" style={{ marginTop: 6, fontSize: 15 }}>{candidates.length} finalists · {selected} selected · target 2–3</p>
        </div>
        <Link href="/review/interviews" className="small" style={{ fontWeight: 600 }}>← Interviews</Link>
      </div>
      <div className="box" style={{ padding: "22px 24px" }}>
        <StageBar current={st.current} counts={st.counts} />
      </div>
      <div className="next-step">
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div className="eyebrow" style={{ color: "var(--accent-on-dark)" }}>Your next step</div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>
            {pendingInterviews > 0 ? `${pendingInterviews} interview${pendingInterviews === 1 ? "" : "s"} still to go` : selected >= 2 ? `${selected} Fellows selected` : "Record the committee's decision for each finalist"}
          </div>
          <div style={{ fontSize: 14, color: "var(--on-dark-body)", lineHeight: 1.5 }}>
            {pendingInterviews > 0
              ? "You can record decisions as you go, but the cohort isn't final until every interview is done."
              : "Interview scores and each reviewer's call are below. Selecting a founder is the committee's decision; it doesn't notify anyone. Terms and the announcement come next."}
          </div>
        </div>
      </div>
      <SelectList rows={candidates} reviewers={st.reviewers.map((r) => ({ email: r.email, first: r.name.split(" ")[0] }))} canDecide={me.screens} />
    </div>
  );
}
