"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { boardService } from "@/services/boardService";

const DRAFT_KEY = "hawk_ai_board_draft";

function jobLabel(job) {
  if (job.status === "PENDING") return "AI 글 생성을 기다리고 있습니다.";
  if (job.status === "RUNNING") return "AI가 게시글을 생성하고 있습니다.";
  if (job.status === "FAILED") return job.error || "AI 글 생성에 실패했습니다.";
  return job.title || "AI 게시글 초안이 완성되었습니다.";
}

export default function BoardAINotifications() {
  const [jobs, setJobs] = useState([]);
  const router = useRouter();

  const refresh = useCallback(async () => {
    try {
      const data = await boardService.aiJobs();
      setJobs(Array.isArray(data) ? data : []);
    } catch {
      /* Authentication initialization and temporary polling failures are retried. */
    }
  }, []);

  useEffect(() => {
    const initial = window.setTimeout(refresh, 0);
    const timer = window.setInterval(refresh, 5000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(timer);
    };
  }, [refresh]);

  const unreadCount = jobs.filter(
    (job) => !job.isRead && (job.status === "COMPLETED" || job.status === "FAILED"),
  ).length;
  const activeCount = jobs.filter(
    (job) => job.status === "PENDING" || job.status === "RUNNING",
  ).length;

  const openJob = async (job) => {
    if (job.status === "COMPLETED") {
      let metadata = {};
      try {
        metadata = JSON.parse(localStorage.getItem(`hawk_ai_board_job_${job.jobId}`)) || {};
      } catch { /* Use the default category when metadata is unavailable. */ }
      const inspectionImage = metadata.inspectionImageUrl
        ? `\n\n## 점검 이미지\n\n![${metadata.inspectionImageAlt || "점검 이미지"}](${metadata.inspectionImageUrl})`
        : "";
      const inspectionLink = metadata.inspectionId
        ? `\n\n[점검이력 #${metadata.inspectionId} 확인하기](/histories?inspectionId=${metadata.inspectionId})`
        : "";
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        categoryId: metadata.categoryId || 1,
        title: job.title,
        summary: job.summary,
        content: `${job.content}${inspectionImage}${inspectionLink}`,
        tags: [],
      }));
      localStorage.removeItem(`hawk_ai_board_job_${job.jobId}`);
      window.dispatchEvent(new Event("hawk-ai:board-draft-ready"));
      router.push("/boards/write");
    }
    if (!job.isRead && (job.status === "COMPLETED" || job.status === "FAILED")) {
      await boardService.readAIJob(job.jobId);
      await refresh();
    }
  };

  return (
    <details className="ai-notifications">
      <summary className="ai-notification-button" aria-label="AI 글 생성 알림">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
        </svg>
        {activeCount > 0 && <span className="ai-notification-progress" aria-label={`${activeCount}개 생성 중`} />}
        {unreadCount > 0 && <span className="ai-notification-badge">{unreadCount}</span>}
      </summary>
      <div className="ai-notification-dropdown">
        <strong>AI 글 생성 알림</strong>
        {jobs.length === 0 && <p>AI 글 생성 내역이 없습니다.</p>}
        {jobs.slice(0, 5).map((job) => (
          <button
            type="button"
            className={`ai-notification-item ${job.status.toLowerCase()}`}
            onClick={() => openJob(job)}
            key={job.jobId}
          >
            <span>{jobLabel(job)}</span>
            <small>{job.status === "COMPLETED" ? "초안 열기" : job.status}</small>
          </button>
        ))}
      </div>
    </details>
  );
}
