import type { CompassKind } from "@/domain/feng-shui/compass";
export function CompassModeIcon({ kind }: { kind: CompassKind }) {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
    >
      <circle cx="32" cy="32" r="27" opacity=".45" />
      <circle cx="32" cy="32" r="21" />
      {Array.from({ length: kind === "luopan" ? 24 : 8 }, (_, i) => (
        <path
          key={i}
          d={kind === "luopan" ? "M32 5V11" : "M32 11V17"}
          transform={`rotate(${i * (kind === "luopan" ? 15 : 45)} 32 32)`}
        />
      ))}
      {kind === "luopan" ? (
        <>
          <path
            d="M32 16L39 39L32 35L25 39Z"
            fill="currentColor"
            fillOpacity=".24"
          />
          <circle cx="32" cy="32" r="3" />
        </>
      ) : kind === "bagua" ? (
        <>
          <path d="M21 23H43M21 31H29M35 31H43M21 39H43" strokeWidth="3" />
        </>
      ) : kind === "gua" ? (
        <>
          <circle cx="32" cy="25" r="6" />
          <path d="M21 43C21 31 43 31 43 43" />
          <circle cx="32" cy="32" r="16" opacity=".4" />
        </>
      ) : (
        <>
          <path d="M19 42L28 31L42 23M35 22L44 21L42 30" strokeWidth="2" />
          <circle cx="19" cy="42" r="3" fill="currentColor" />
        </>
      )}
    </svg>
  );
}
