import Link from "next/link";
import { redirect } from "next/navigation";
import { currentReviewer } from "@/lib/session";
import { getRoundState } from "@/lib/stage";
import { deadlineLong } from "@/lib/settings";
import { StageBar } from "@/components/review/StageBar";
import { HomeList } from "@/components/review/HomeList";
import { DecideList } from "@/components/review/DecideList";
import { Countdown } from "@/components/Countdown";
import { DataError } from "@/components/review/DataError";

export const dynamic = "force-dynamic";

export default async function Home() {
  const me = await currentReviewer();
  if (!me) redirect("/review/login");
  if (!me.screens) redirect("/review/interviews");

  let st;
  try {
    st = await getRoundState();
  } catch (e) {
    return <DataError error={e} />;
  }

  const mine = st.perScreener[me.email] || { done: 0, total: 0 };
  const others = st.screeners.filter((r) => r.email !== me.email);
  const toScore = st.submitted.filter((r) => r.screen[me.email]?.avg == null);
  const scored = st.submitted.filter((r) => r.screen[me.email]?.avg != null);
  const received = st.rows.filter((r) => r.status !== "Draft").length;
  const inDecide = st.current === "decide" || (st.current === "interview" && st.submitted.length > 0);

  // The one sentence + one button for this reviewer right now.
  let step: { title: string; body: string; cta?: { label: string; href: string } };
  if (st.submitted.length === 0 && st.finalists.length === 0 && st.decided.length === 0) {
    step = { title: "Waiting for applications", body: st.settings.accepting ? "Applications are open. Share the link and check back here." : "Applications are closed and none were received." };
  } else if (toScore.length > 0) {
    const waitingOn = others.filter((o) => st.perScreener[o.email].done < st.perScreener[o.email].total);
    step = {
      title: `Score your ${toScore.length} remaining application${toScore.length === 1 ? "" : "s"}`,
      body: `${others.map((o) => `${o.name.split(" ")[0]} has scored ${st.perScreener[o.email].done} of ${st.perScreener[o.email].total}.`).join(" ")} Your scores stay private until ${waitingOn.length ? "you both finish" : "you finish"}; then Decide opens with everything side by side.`,
      cta: { label: `Score next: ${toScore[0].name.split(" ")[0]} (${toScore[0].company}) →`, href: `/review/${toScore[0].id}` },
    };
  } else if (!st.allScreened && st.submitted.length > 0) {
    const waitingOn = others.filter((o) => st.perScreener[o.email].done < st.perScreener[o.email].total);
    step = {
      title: "You're done scoring",
      body: `Waiting on ${waitingOn.map((o) => `${o.name.split(" ")[0]} (${st.perScreener[o.email].total - st.perScreener[o.email].done} left)`).join(", ")}. Decide opens when everyone has finished. You can still edit your scores below.`,
    };
  } else if (inDecide) {
    const invited = st.finalists.length + st.decided.length;
    step = {
      title: invited ? `${invited} invited so far · ${st.submitted.length} still to decide` : "Decide who to interview",
      body: "Both sets of scores are below, sorted by committee average. Invite anyone you want to meet; you can keep inviting, undo, or revisit your own score on any application. When you're done, Finish deciding marks the rest Not selected and closes applications.",
    };
  } else if (st.current === "interview") {
    const next = [...st.finalists].filter((f) => f.status === "Finalist").sort((a, b) => (a.interviewTime || "9").localeCompare(b.interviewTime || "9"))[0];
    step = {
      title: `${st.finalists.length} finalist${st.finalists.length === 1 ? "" : "s"} to interview`,
      body: "Send each finalist their materials link, set the interview time, and open the prep page before the conversation.",
      cta: next ? { label: `Prep: ${next.name.split(" ")[0]} (${next.company}) →`, href: `/review/${next.id}/interview` } : undefined,
    };
  } else if (st.current === "select") {
    step = { title: "All interviews are done", body: "Compare interview scores and record the committee's decision for each finalist.", cta: { label: "Go to Select →", href: "/review/select" } };
  } else {
    step = { title: `${st.decided.filter((r) => r.status === "Selected").length} Fellows selected`, body: "Selection is complete. Next: terms, materials, and the announcement.", cta: { label: "See the cohort →", href: "/review/select" } };
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div className="eyebrow">2027 Cohort</div>
          <h1 style={{ fontSize: 30, fontWeight: 800, marginTop: 6 }}>Selection Committee</h1>
          <p className="body" style={{ marginTop: 6, fontSize: 15 }}>
            {received} application{received === 1 ? "" : "s"} received · close {deadlineLong(st.settings.deadline)}
            {st.settings.accepting && <> · <Countdown deadline={st.settings.deadline} /></>}
          </p>
        </div>
        <span className={`pill ${st.settings.accepting ? "selected" : "not-selected"}`} style={{ padding: "7px 12px" }}>
          {st.settings.accepting ? "● Applications currently open" : "Applications closed"}
        </span>
      </div>

      <div className="box" style={{ padding: "22px 24px" }}>
        <StageBar current={st.current} counts={st.counts} />
      </div>

      <div className="next-step">
        <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
          <div className="eyebrow" style={{ color: "var(--accent-on-dark)" }}>Your next step</div>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.01em" }}>{step.title}</div>
          <div style={{ fontSize: 14, color: "var(--on-dark-body)", lineHeight: 1.5 }}>{step.body}</div>
        </div>
        {step.cta && <Link href={step.cta.href} className="btn btn-accent" style={{ whiteSpace: "nowrap" }}>{step.cta.label}</Link>}
      </div>

      {inDecide ? (
        <DecideList rows={st.submitted} invited={[...st.finalists, ...st.decided]} screeners={st.screeners.map((r) => ({ email: r.email, first: r.name.split(" ")[0] }))} />
      ) : (
        <HomeList toScore={toScore} scored={scored} me={me.email} others={others.map((o) => ({ email: o.email, first: o.name.split(" ")[0] }))} total={st.submitted.length} mineDone={mine.done} />
      )}

      <div className="box" style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap", padding: "16px 24px" }}>
        <div style={{ display: "flex", gap: 28, flexWrap: "wrap", fontSize: 13 }}>
          <span><span className="muted">Applications</span> <b style={{ color: st.settings.accepting ? "#116b2b" : "var(--muted)" }}>{st.settings.accepting ? "currently open" : "closed"}</b></span>
          <span><span className="muted">Deadline</span> <b>{deadlineLong(st.settings.deadline)} · 11:59 PM PT</b></span>
          <span><span className="muted">Reviewers</span> <b>{st.screeners.map((r) => r.name.split(" ")[0]).join(", ")}</b> screen · <b>{st.reviewers.filter((r) => !r.screens).map((r) => r.name.split(" ")[0]).join(", ") || "—"}</b> joins at Interview</span>
          <span><span className="muted">Nominations</span> <Link href="/review/nominations">view →</Link></span>
        </div>
        <Link href="/review/settings" className="small" style={{ fontWeight: 600 }}>Round settings →</Link>
      </div>
    </div>
  );
}
