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
          <div className="eyebrow">Applications close {deadlineLong()} · <Countdown /></div>
          <h1>Bravo Venture Fellowship</h1>
          <p className="lede">$250,000 and a year of hands-on support for founders of Puerto Rican descent.</p>
          <p className="desc">
            A program of the <a href="https://www.bravofamilyfoundation.org">Bravo Family Foundation</a>. Open to founders building in Puerto Rico, New York City, Miami, or the San Francisco Bay Area.
          </p>
          <div className="hero-ctas">
            <Link href="#apply" className="btn btn-accent">Apply · about 12 minutes</Link>
            <Link href="#nominate" style={{ fontWeight: 600, textDecoration: "none", padding: "0 8px" }}>Nominate a founder →</Link>
          </div>
          <div className="tiles" id="benefits">
            <div className="tile"><BenefitArt kind="capital" dark /><b>$250,000 investment</b><span>A standard SAFE at the valuation cap of your most recent round, plus a small common-stock purchase.</span></div>
            <div className="tile"><BenefitArt kind="mentorship" dark /><b>A Thoma Bravo advisor</b><span>Paired with you for the year as a thought partner on strategy, go-to-market, and organizational questions.</span></div>
            <div className="tile"><BenefitArt kind="communications" dark /><b>PR and fundraising support</b><span>Dedicated public relations support, including media placements, and hands-on help with your pitch and your raise.</span></div>
            <div className="tile"><BenefitArt kind="orlando" dark /><b>Time with Orlando Bravo</b><span>Orlando meets with each Fellow during the program to review their business and offer support.</span></div>
            <div className="tile"><BenefitArt kind="community" dark /><b>A community of Puerto Rican founders</b><span>Fellowship alumni and founders from across the Foundation&apos;s programs, plus the Foundation&apos;s resources for entrepreneurs in Puerto Rico.</span></div>
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

      <section className="section alt">
        <div className="wrap">
          <div className="quote">
            <p>&ldquo;[Quote from a previous Fellow about their experience in the program.]&rdquo;</p>
            <span>[Name] · [Title], [Company] · [Year] Fellow</span>
          </div>
        </div>
      </section>

      <section id="apply" className="section">
        <div className="narrow" style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div className="section-head">
            <div className="eyebrow">Apply</div>
            <h2>Two questions, then the application.</h2>
            <p className="body" style={{ fontSize: 17 }}>These are the only hard requirements. The rest is about you and your company, and takes about twelve minutes.</p>
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
