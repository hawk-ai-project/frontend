"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./presentation.module.css";

export default function PresentationViewer({ source, title }) {
  const stageRef = useRef(null);
  const renderTargetRef = useRef(null);
  const pptxViewerRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideCount, setSlideCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewerError, setViewerError] = useState("");
  const [fullscreenError, setFullscreenError] = useState("");

  useEffect(() => {
    const abortController = new AbortController();
    let disposed = false;

    const openPresentation = async () => {
      setLoading(true);
      setViewerError("");
      try {
        const [{ PptxViewer, RECOMMENDED_ZIP_LIMITS }, response] =
          await Promise.all([
            import("@aiden0z/pptx-renderer"),
            fetch(source, { signal: abortController.signal }),
          ]);
        if (!response.ok) throw new Error("PPTX file could not be loaded.");
        const buffer = await response.arrayBuffer();
        if (disposed || !renderTargetRef.current) return;

        const viewer = await PptxViewer.open(buffer, renderTargetRef.current, {
          renderMode: "slide",
          fitMode: "contain",
          zipLimits: RECOMMENDED_ZIP_LIMITS,
          lazyMedia: true,
          lazySlides: true,
          pdfjs: false,
        });
        if (disposed) {
          viewer.destroy();
          return;
        }

        pptxViewerRef.current = viewer;
        setSlideCount(viewer.slideCount);
        setCurrentSlide(viewer.currentSlideIndex || 0);
        viewer.addEventListener("slidechange", (event) => {
          setCurrentSlide(event.detail.index);
        });
      } catch (error) {
        if (!disposed && error?.name !== "AbortError") {
          setViewerError("PPTX 발표자료를 불러오지 못했습니다.");
        }
      } finally {
        if (!disposed) setLoading(false);
      }
    };

    void openPresentation();
    return () => {
      disposed = true;
      abortController.abort();
      pptxViewerRef.current?.destroy();
      pptxViewerRef.current = null;
    };
  }, [source]);

  const goToSlide = useCallback(
    async (nextSlide) => {
      if (!pptxViewerRef.current || !slideCount) return;
      const target = Math.min(slideCount - 1, Math.max(0, nextSlide));
      await pptxViewerRef.current.goToSlide(target);
      setCurrentSlide(target);
    },
    [slideCount],
  );

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (["ArrowRight", "PageDown", " "].includes(event.key)) {
        event.preventDefault();
        void goToSlide(currentSlide + 1);
      } else if (["ArrowLeft", "PageUp"].includes(event.key)) {
        event.preventDefault();
        void goToSlide(currentSlide - 1);
      } else if (event.key === "Home") {
        event.preventDefault();
        void goToSlide(0);
      } else if (event.key === "End") {
        event.preventDefault();
        void goToSlide(slideCount - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlide, goToSlide, slideCount]);

  useEffect(() => {
    const syncFullscreenState = () => {
      setIsFullscreen(document.fullscreenElement === stageRef.current);
    };
    document.addEventListener("fullscreenchange", syncFullscreenState);
    return () =>
      document.removeEventListener("fullscreenchange", syncFullscreenState);
  }, []);

  const toggleFullscreen = async () => {
    setFullscreenError("");
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (stageRef.current?.requestFullscreen) {
        await stageRef.current.requestFullscreen();
      } else {
        setFullscreenError("이 브라우저에서는 전체화면을 지원하지 않습니다.");
      }
    } catch {
      setFullscreenError("전체화면 모드를 시작하지 못했습니다.");
    }
  };

  return (
    <section className={styles.viewerShell} aria-label={title + " 발표 뷰어"}>
      <div ref={stageRef} className={styles.stage}>
        <div ref={renderTargetRef} className={styles.renderTarget} />
        {loading && <div className={styles.viewerState}>PPTX 렌더링 중...</div>}
        {viewerError && <div className={styles.viewerState}>{viewerError}</div>}

        <div className={styles.presentationControls}>
          <button
            type="button"
            onClick={() => void goToSlide(currentSlide - 1)}
            disabled={loading || currentSlide === 0}
          >
            ←
          </button>
          <span>
            {slideCount ? currentSlide + 1 : 0} / {slideCount}
          </span>
          <button
            type="button"
            onClick={() => void goToSlide(currentSlide + 1)}
            disabled={loading || currentSlide >= slideCount - 1}
          >
            →
          </button>
          <button type="button" onClick={toggleFullscreen}>
            {isFullscreen ? "전체화면 종료" : "전체화면"}
          </button>
        </div>
      </div>

      <div className={styles.viewerHelp}>
        <span>← → 방향키 · Space · PageUp/Down으로 슬라이드 이동</span>
        <span>Home 첫 장 · End 마지막 장 · Esc 전체화면 종료</span>
      </div>
      {fullscreenError && (
        <p className={styles.fullscreenError} role="alert">
          {fullscreenError}
        </p>
      )}
    </section>
  );
}
