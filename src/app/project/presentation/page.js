import Link from "next/link";
import styles from "./presentation.module.css";
import PresentationViewer from "./PresentationViewer";

const presentationBase = "/documents/hawk-ai-presentation-20260827";

export const metadata = {
  title: "HAWK-AI Presentation",
  description: "View the HAWK-AI project presentation.",
};

export default function ProjectPresentationPage() {
  return (
    <main className={["page-shell", styles.page].join(" ")}>
      <header className={styles.header}>
        <div>
          <span>PROJECT PRESENTATION</span>
          <h1>HAWK-AI 발표자료</h1>
          <p>2026년 8월 27일 프로젝트 발표자료</p>
        </div>
        <div className={styles.actions}>
          <a
            className="btn btn-primary"
            href={presentationBase + ".pptx"}
            download="HAWK-AI-presentation-20260827.pptx"
          >
            PPTX 다운로드
          </a>
          <a
            className="btn btn-soft"
            href={presentationBase + ".pdf"}
            target="_blank"
            rel="noopener noreferrer"
          >
            PDF 새 탭
          </a>
          <Link className="btn btn-soft" href="/">
            홈으로
          </Link>
        </div>
      </header>

      <PresentationViewer
        src={presentationBase + ".pdf#view=FitH&toolbar=1&navpanes=0"}
        title="HAWK-AI 발표자료"
      />
    </main>
  );
}
