import styles from "./palace-gold-glow.module.css";

/** Decorative perimeter only: the palace contents and hit area stay clear. */
export function PalaceGoldGlow() {
  return (
    <span className={styles.glow} aria-hidden="true">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
        <rect
          className={styles.contour}
          x="1"
          y="1"
          width="98"
          height="98"
          rx="2"
          pathLength="100"
        />
        <rect
          className={styles.trail}
          x="1"
          y="1"
          width="98"
          height="98"
          rx="2"
          pathLength="100"
        />
        <rect
          className={styles.sparks}
          x="1"
          y="1"
          width="98"
          height="98"
          rx="2"
          pathLength="100"
        />
        <rect
          className={styles.fineSparks}
          x="1"
          y="1"
          width="98"
          height="98"
          rx="2"
          pathLength="100"
        />
      </svg>
    </span>
  );
}
