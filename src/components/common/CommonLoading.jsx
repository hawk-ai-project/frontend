import styles from "./CommonLoading.module.css";

export default function CommonLoading({ message = "불러오는 중..." }) {
  return (
    <div className={styles.area} role="status" aria-live="polite">
      <div className={styles.card}>
        {/* Keep the GIF animation intact without image optimization. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.character}
          src="/images/hawk-ai-hello.gif"
          alt=""
          aria-hidden="true"
        />
        <p>{message}</p>
      </div>
    </div>
  );
}
