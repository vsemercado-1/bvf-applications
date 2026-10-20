// Simple line illustrations for the four benefit cards, in the brand blue.
// To use photos instead, drop images in public/benefits/ and swap the <svg> for an <img>.

const common = {
  width: 56,
  height: 56,
  viewBox: "0 0 56 56",
  fill: "none",
  stroke: "#0171cc",
  strokeWidth: 2.25,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function BenefitArt({ kind, dark = false }: { kind: "capital" | "mentorship" | "communications" | "orlando"; dark?: boolean }) {
  const c = dark ? { ...common, stroke: "#4a9deb", width: 36, height: 36 } : common;
  return (
    <div className={dark ? "benefit-art-dark" : "benefit-art"}>
      {kind === "capital" && (
        <svg {...c}>
          <ellipse cx="28" cy="16" rx="16" ry="6" />
          <path d="M12 16v8c0 3.3 7.2 6 16 6s16-2.7 16-6v-8" />
          <path d="M12 24v8c0 3.3 7.2 6 16 6s16-2.7 16-6v-8" />
          <path d="M12 32v8c0 3.3 7.2 6 16 6s16-2.7 16-6v-8" />
        </svg>
      )}
      {kind === "mentorship" && (
        <svg {...c}>
          <circle cx="20" cy="18" r="6" />
          <circle cx="38" cy="22" r="5" />
          <path d="M8 44c0-7 5.4-12 12-12s12 5 12 12" />
          <path d="M31 44c0-5.5 3.5-9 8-9s9 3.5 9 9" />
          <path d="M40 8l3 3-3 3" />
          <path d="M43 11h-7" />
        </svg>
      )}
      {kind === "communications" && (
        <svg {...c}>
          <path d="M10 24v8a3 3 0 0 0 3 3h5l12 8V13l-12 8h-5a3 3 0 0 0-3 3z" />
          <path d="M36 20c2.5 2 4 5 4 8s-1.5 6-4 8" />
          <path d="M41 14c4 3.5 6.5 8.5 6.5 14s-2.5 10.5-6.5 14" />
          <path d="M16 35l2 9" />
        </svg>
      )}
      {kind === "orlando" && (
        <svg {...c}>
          <path d="M10 14h26a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4H22l-8 7v-7h-4a4 4 0 0 1-4-4V18a4 4 0 0 1 4-4z" />
          <path d="M46 24h2a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-2v5l-6-5h-4" />
          <path d="M17 26h14" />
          <path d="M17 21h18" />
        </svg>
      )}
    </div>
  );
}
