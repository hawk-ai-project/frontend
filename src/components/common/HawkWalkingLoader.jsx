import styles from "./HawkWalkingLoader.module.css";

export default function HawkWalkingLoader() {
  return (
    <div className={styles.track} aria-hidden="true">
      <div className={styles.mover}>
        {/* The native img element preserves the animated GIF without optimization. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.character}
          src="/images/hawk-ai-walking-loader-transparent.gif"
          alt=""
        />
      </div>
    </div>
  );
}
