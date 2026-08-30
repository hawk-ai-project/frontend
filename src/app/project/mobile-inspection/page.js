import Link from "next/link";
import styles from "./mobile-inspection.module.css";

const videoSource = "/videos/hawk-ai-mobile-inspection-demo.mp4";

export const metadata = {
  title: "HAWK-AI 모바일 현장점검 앱 시연",
  description:
    "현장점검자가 모바일 앱으로 점검하는 과정을 담은 시연 영상입니다.",
};

export default function MobileInspectionDemoPage() {
  return (
    <main className={["page-shell", styles.page].join(" ")}>
      <header className={styles.header}>
        <div>
          <span>MOBILE FIELD INSPECTION</span>
          <h1>모바일 현장점검 앱 시연</h1>
          <p>
            현장점검자가 모바일 앱을 이용해 현장에서 점검을 수행하는 과정을
            확인할 수 있습니다.
          </p>
        </div>
        <div className={styles.actions}>
          <a
            className="btn btn-primary"
            href={videoSource}
            download="HAWK-AI-mobile-inspection-demo.mp4"
          >
            영상 다운로드
          </a>
          <Link className="btn btn-soft" href="/project/presentation">
            발표자료 보기
          </Link>
          <Link className="btn btn-soft" href="/">
            홈으로
          </Link>
        </div>
      </header>

      <section
        className={styles.viewer}
        aria-label="모바일 현장점검 앱 시연 영상"
      >
        <video controls playsInline preload="metadata">
          <source src={videoSource} type="video/mp4" />
          브라우저가 MP4 영상 재생을 지원하지 않습니다.
        </video>
      </section>

      <aside className={styles.help}>
        <strong>재생 안내</strong>
        <span>
          영상 플레이어의 전체화면 버튼을 누르면 모바일 앱 시연을 전체화면으로
          볼 수 있습니다.
        </span>
      </aside>
    </main>
  );
}
