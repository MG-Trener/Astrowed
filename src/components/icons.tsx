export function Mark({ small = false }: { small?: boolean }) {
  return (
    <svg
      width={small ? 26 : 36}
      height={small ? 26 : 36}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M20 2 38 20 20 38 2 20 20 2Z M9 12v16M15 7v26M25 7v26M31 12v16"
        stroke="currentColor"
        strokeWidth="1"
      />
      <circle cx="20" cy="20" r="5" stroke="currentColor" />
      <path d="M20 9v22M10 20h20" stroke="currentColor" strokeWidth=".7" />
    </svg>
  );
}
export function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d={diagonal ? "M5 19 19 5M5 5h14v14" : "M4 12h15m-6-6 6 6-6 6"}
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}
