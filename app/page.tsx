import Link from "next/link";
import { SiteHeader, SiteFooter, deadlineLabel } from "@/components/SiteChrome";
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
          <div className="eyebrow">2027 Cohort · Applications open through {deadlineLabel()}</div>
          <h1>Bravo Venture Fellowship</h1>
          <p className="lede">$250,000 in early-stage funding and a one-year fellowship for founders of Puerto Rican descent.</p>
          <p className="desc">
            An initiative of the <a href="https://www.bravofamilyfoundation.org">Bravo Family Foundation</a>, the Fellowship supports Puerto Rican entrepreneurs building ambitious companies in Puerto Rico or the New York City, Miami, and San Francisco metro areas as they prepare to raise institutional capital.
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
            <b>BrainHi</b><b>Skootel</b><b>GoSprout</b><b>Raya Power</b>
          </div>
        </div>
      </section>

      <section id="eligibility" className="section">
        <div className="wrap two-col">
          <div className="section-head">
            <div className="eyebrow">Eligibility</div>
            <h2>Who Can Apply</h2>
            <p className="body" style={{ fontSize: 17, lineHeight: 1.6 }}>
              The Fellowship is designed for founders who have established early traction and are preparing to raise institutional venture capital. The investment is intended to be catalytic: companies are typically pre-Series A and have raised less than approximately $3 million. The Foundation also considers each company&apos;s potential contribution to Puerto Rico&apos;s economy over the course of the program.
            </p>
          </div>
          <div className="lists">
            <div className="list">
              <div className="list-title">Requirements</div>
              <div className="list-item"><Check />Founder or co-founder of Puerto Rican descent</div>
              <div className="list-item"><Check />Resident of Puerto Rico, the New York City metro area, the Miami metro area, or the San Francisco Bay Area</div>
              <div className="list-item"><Check />Venture-stage company with paying customers, pilots, or signed commitments</div>
              <div className="list-item"><Check />Any industry; previous Fellows have built software, hardware, and services businesses</div>
              <div className="list-item"><Check />Planning to raise capital within the next twelve months</div>
            </div>
            <div className="list">
              <div className="list-title" style={{ color: "var(--muted)" }}>Generally not a fit</div>
              <div className="list-item body"><Cross />Pre-product or idea-stage companies</div>
              <div className="list-item body"><Cross />Companies that have raised a priced Series A, or for which $250,000 would not be material</div>
              <div className="list-item body"><Cross />Founders based in Puerto Rico who are not of Puerto Rican descent</div>
              <div className="list-item body"><Cross />Businesses not intended to scale</div>
              <p className="small muted" style={{ marginTop: 4 }}>Founders who do not yet meet these criteria are welcome to apply and will be considered for future cohorts.</p>
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
              <span className="num">01</span>
              <h3>$250,000 Investment</h3>
              <p>The Foundation invests $250,000 in each Fellow&apos;s company through a standard SAFE at the valuation cap of the company&apos;s most recent round, together with a small common-stock purchase. Terms are the same for every Fellow.</p>
            </div>
            <div className="card">
              <span className="num">02</span>
              <h3>Mentorship and Network Access</h3>
              <p>Each Fellow is paired with an advisor from Thoma Bravo for the duration of the program, serving as a thought partner on strategy, go-to-market, and organizational questions. Fellows may request introductions to Thoma Bravo portfolio companies and the firm&apos;s broader network.</p>
            </div>
            <div className="card">
              <span className="num">03</span>
              <h3>Communications and Fundraising Support</h3>
              <p>Fellows receive dedicated public relations support, including media placements, and hands-on preparation for fundraising, including pitch development and investor outreach. In the 2026 cohort, this work contributed to a seed term sheet and to follow-on capital well in excess of a Fellow&apos;s initial plan.</p>
            </div>
            <div className="card">
              <span className="num">04</span>
              <h3>Mentorship from Orlando Bravo</h3>
              <p>Orlando Bravo meets with each Fellow during the program to review the business and offer guidance drawn from his experience building Thoma Bravo.</p>
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
            <p className="body" style={{ fontSize: 17 }}>Applicants must meet the two requirements below. The remaining questions concern the applicant and the company, and take approximately twelve minutes. Responses are saved automatically.</p>
          </div>
          <EligibilityGate />
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
