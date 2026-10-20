import Link from "next/link";
import { SiteHeader, SiteFooter, deadlineLong } from "@/components/SiteChrome";
import { Countdown } from "@/components/Countdown";
import { BenefitArt } from "@/components/BenefitArt";
import { EligibilityGate } from "@/components/EligibilityGate";
import { NominateForm } from "@/components/NominateForm";

const Check = () => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0a5fb0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
);
const Cross = () => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9a9a9a" strokeWidth="3" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
);

export default function Home() {
  return (
    <>
      <SiteHeader />

      <section className="dark hero">
        <div className="hero-glow" aria-hidden="true" />
        <div className="wrap">
          <div className="eyebrow">Applications open through 11:59 PM PT {deadlineLong()} · <Countdown /></div>
          <h1>Bravo Venture Fellowship</h1>
          <p className="lede">$250,000 in early-stage funding and a one-year fellowship for founders of Puerto Rican descent.</p>
          <p className="desc">
            An initiative of the <a href="https://www.bravofamilyfoundation.org">Bravo Family Foundation</a>, the Fellowship supports Puerto Rican entrepreneurs building ambitious companies in Puerto Rico, New York City, Miami, or the San Francisco Bay Area as they prepare to raise institutional capital.
          </p>
          <div className="hero-ctas">
            <Link href="#apply" className="btn btn-accent">Check Your Eligibility</Link>
            <Link href="#nominate" style={{ fontWeight: 600, textDecoration: "none", padding: "0 8px" }}>Nominate a Founder →</Link>
          </div>
          <div className="stats">
            <div className="stat"><b>$250,000</b><span>Investment in each Fellow&apos;s company</span></div>
            <div className="stat"><b>One year</b><span>Program duration, February through December</span></div>
            <div className="stat"><b>2–3</b><span>Fellows selected per cohort</span></div>
            <div className="stat"><b>4</b><span>Eligible regions, including the Bay Area for the first time</span></div>
          </div>
          <div className="fellows">
            <span className="eyebrow">Previous Fellows</span>
            <a href="https://brainhi.com" target="_blank" rel="noreferrer">BrainHi</a><a href="https://skootel.com" target="_blank" rel="noreferrer">Skootel</a><a href="https://gosprout.app" target="_blank" rel="noreferrer">GoSprout</a><a href="https://rayapower.com" target="_blank" rel="noreferrer">Raya Power</a>
          </div>
        </div>
      </section>

      <section id="eligibility" className="section">
        <div className="wrap two-col">
          <div className="section-head">
            <div className="eyebrow">Eligibility</div>
            <h2>Who Can Apply</h2>
            <p className="body" style={{ fontSize: 17, lineHeight: 1.6 }}>
              The Fellowship is designed for founders who have established early traction with their companies and are preparing to raise institutional venture capital. Their companies are typically pre-Series A and have raised less than $3 million. The Foundation will consider each company&apos;s potential contribution to Puerto Rico&apos;s economy over the course of the program.
            </p>
          </div>
          <div className="lists">
            <div className="list">
              <div className="list-title">Signs you&apos;re a good fit</div>
              <div className="list-item"><Check />You&apos;re a founder of Puerto Rican descent.</div>
              <div className="list-item"><Check />You live in Puerto Rico, New York City, Miami, or the San Francisco Bay Area.</div>
              <div className="list-item"><Check />You&apos;re building a venture-stage company with paying customers, pilots, or signed commitments.</div>
              <div className="list-item"><Check />You&apos;re planning to raise capital in the next 12 months.</div>
            </div>
            <div className="list">
              <div className="list-title" style={{ color: "var(--muted)" }}>You may not be a good fit</div>
              <div className="list-item body"><Cross />You&apos;re pre-product or at the idea stage.</div>
              <div className="list-item body"><Cross />Your company has already raised a priced Series A, or $250,000 would not be material to your business.</div>
              <div className="list-item body"><Cross />You&apos;re based in Puerto Rico but are not of Puerto Rican descent.</div>
              <div className="list-item body"><Cross />You don&apos;t intend to scale your business significantly.</div>
            </div>
          </div>
        </div>
      </section>

      <section id="benefits" className="section alt">
        <div className="wrap" style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          <div className="section-head">
            <div className="eyebrow">Program</div>
            <h2>Fellowship Benefits</h2>
          </div>
          <div className="cards">
            <div className="card">
              <BenefitArt kind="capital" />
              <h3>$250,000 Investment</h3>
              <p>The Foundation invests $250,000 in each Fellow&apos;s company through a standard SAFE at the valuation cap of the company&apos;s most recent round, together with a small common-stock purchase.</p>
            </div>
            <div className="card">
              <BenefitArt kind="mentorship" />
              <h3>Mentorship and Network Access</h3>
              <p>Each Fellow is paired with an advisor from Thoma Bravo for the duration of the program, serving as a thought partner on strategy, go-to-market, and organizational questions.</p>
            </div>
            <div className="card">
              <BenefitArt kind="communications" />
              <h3>Communications and Fundraising Support</h3>
              <p>Fellows receive dedicated public relations support, including media placements, and hands-on preparation for fundraising, including pitch development and investor outreach.</p>
            </div>
            <div className="card">
              <BenefitArt kind="orlando" />
              <h3>Mentorship from Orlando Bravo</h3>
              <p>Orlando Bravo meets with each Fellow during the program to review their business and offer support.</p>
            </div>
          </div>
          <div className="quote">
            <p>&ldquo;[Quote from a previous Fellow about their experience in the program.]&rdquo;</p>
            <span>[Name] · [Title], [Company] · [Year] Fellow</span>
          </div>
        </div>
      </section>

      <section id="apply" className="section">
        <div className="narrow" style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div className="section-head">
            <div className="eyebrow">Application</div>
            <h2>Check Your Eligibility</h2>
            <p className="body" style={{ fontSize: 17 }}>You&apos;ll need to meet the two requirements below. The rest of the application is about you and your company, and takes about twelve minutes. Your answers are saved automatically.</p>
          </div>
          <EligibilityGate />
          <p className="small muted" style={{ textAlign: "center" }}>Already started? Come back on the same browser, or use the private link from your application.</p>
        </div>
      </section>

      <section id="nominate" className="section alt" style={{ borderBottom: 0 }}>
        <div className="wrap two-col" style={{ alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <h2 style={{ fontSize: 28 }}>Nominate a Founder</h2>
            <p className="body">The Foundation welcomes referrals. Provide a founder&apos;s name and company, and the Foundation will contact them directly.</p>
          </div>
          <NominateForm />
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
