"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./presentation.module.css";

export default function PresentationViewer({ src, title }) {
  const viewerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenError, setFullscreenError] = useState("");

  useEffect(() => {
    const syncFullscreenState = () => {
      setIsFullscreen(document.fullscreenElement === viewerRef.current);
    };

    document.addEventListener("fullscreenchange", syncFullscreenState);
    return () => {
      document.removeEventListener("fullscreenchange", syncFullscreenState);
    };
  }, []);

  const toggleFullscreen = async () => {
    setFullscreenError("");
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }
      if (!viewerRef.current?.requestFullscreen) {
        setFullscreenError("이 브라우저에서는 전체화면을 지원하지 않습니다.");
        return;
      }
      await viewerRef.current.requestFullscreen();
    } catch {
      setFullscreenError("전체화면 모드를 시작하지 못했습니다.");
    }
  };

  return (
    <section
      ref={viewerRef}
      className={styles.viewer}
      aria-label={title + " 뷰어"}
    >
      <div className={styles.viewerToolbar}>
        <span>
          {isFullscreen ? "PRESENTATION MODE" : "PRESENTATION VIEWER"}
        </span>
        <button type="button" onClick={toggleFullscreen}>
          <span aria-hidden="true">{isFullscreen ? "↙" : "⛶"}</span>
          {isFullscreen ? "전체화면 종료" : "전체화면"}
        </button>
      </div>
      {fullscreenError && (
        <p className={styles.fullscreenError} role="alert">
          {fullscreenError}
        </p>
      )}
      <iframe src={src} title={title} allowFullScreen />
      <noscript>
        발표자료를 보려면 JavaScript를 활성화하거나 PDF 파일을 내려받아 주세요.
      </noscript>
    </section>
  );
}
