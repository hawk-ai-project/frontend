"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { boardService } from "@/services/boardService";
import { getApiErrorMessage } from "@/services/apiClient";

export default function BoardArticleActions({ post, canEdit }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const remove = async () => {
    if (!window.confirm("게시글을 삭제하시겠습니까?")) return;
    try {
      setDeleting(true);
      setError("");
      await boardService.remove(post.id);
      router.push("/boards");
      router.refresh();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "게시글을 삭제하지 못했습니다."));
      setDeleting(false);
    }
  };

  return (
    <div className="article-actions">
      <div>
        <Link className="btn btn-secondary" href="/boards">목록으로</Link>
        {error && <p className="board-save-notice" role="alert">{error}</p>}
      </div>
      {canEdit && (
        <div>
          <Link className="btn btn-soft" href={`/boards/${post.id}/edit`}>수정</Link>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={remove}
            disabled={deleting}
          >
            {deleting ? "삭제 중..." : "삭제"}
          </button>
        </div>
      )}
    </div>
  );
}
