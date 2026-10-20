import Link from "next/link";

export function Brand({ variant = "dark" }: { variant?: "dark" | "light" }) {
  // logo-dark.png is the version for dark backgrounds (white mark and white "FELLOWSHIP").
  const src = variant === "dark" ? "/logo-dark.png" : "/logo.png";
  return (
    <Link href="/" className="brand" aria-label="Bravo Venture Fellowship home">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="Bravo Venture Fellowship" className="brand-logo" width={1600} height={286} />
    </Link>
  );
}

export function SiteHeader({ nav = true }: { nav?: boolean }) {
  return (
    <div className="dark">
      <div className="wrap site-header">
        <Brand />
        {nav && (
          <nav className="site-nav" aria-label="Primary">
            <Link href="/#eligibility">Who Can Apply</Link>
            <Link href="/#benefits">What You Get</Link>
            <Link href="/#nominate">Nominate a Founder</Link>
            <Link href="/#apply" className="btn btn-accent">Apply</Link>
          </nav>
        )}
      </div>
    </div>
  );
}

export function SiteFooter() {
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "";
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div style={{ maxWidth: 520 }}>
          <b>Timeline</b>
          Applications are reviewed on a rolling basis through {deadlineLong()}. Finalists are interviewed by the selection committee in late January. Fellows are announced in February, and the program runs through December.
        </div>
        <div className="footer-brand">
          <a href="https://www.bravofamilyfoundation.org" aria-label="Bravo Family Foundation">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/bff-wordmark.png" alt="Bravo Family Foundation" className="bff-wordmark" width={900} height={251} />
          </a>
          <b>A program of the Bravo Family Foundation</b>
          <span>
            <a href="https://www.bravofamilyfoundation.org">bravofamilyfoundation.org</a>
            {email && (
              <>
                {" · Questions? "}
                <a href={`mailto:${email}`}>{email}</a>
              </>
            )}
            {" · "}
            <Link href="/review" style={{ color: "var(--muted)" }}>Selection committee</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}

export function deadlineLabel(): string {
  const raw = process.env.NEXT_PUBLIC_DEADLINE || "2027-01-15";
  const d = new Date(raw + "T12:00:00Z");
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "UTC" });
}

export function deadlineLong(): string {
  const raw = process.env.NEXT_PUBLIC_DEADLINE || "2027-01-15";
  const d = new Date(raw + "T12:00:00Z");
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
}
