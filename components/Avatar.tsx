// Circular avatar: the applicant's photo if there is one, otherwise initials
// on the brand blue. Used in the application header and reviewer views.

export function Avatar({ src, name, size = 40 }: { src?: string; name?: string; size?: number }) {
  const initials = (name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");
  const style: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: "50%",
    flex: `0 0 ${size}px`,
    objectFit: "cover",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: src ? "#eee" : "var(--accent)",
    color: "#fff",
    fontWeight: 700,
    fontSize: Math.round(size * 0.38),
    letterSpacing: "0.02em",
    overflow: "hidden",
  };
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name ? `Photo of ${name}` : "Photo"} style={style} />;
  }
  return (
    <span style={style} aria-hidden="true">
      {initials || (
        <svg width={Math.round(size * 0.55)} height={Math.round(size * 0.55)} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
        </svg>
      )}
    </span>
  );
}
