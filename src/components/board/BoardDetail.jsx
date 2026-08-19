"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { boardService } from "@/services/boardService";
import { getApiErrorMessage } from "@/services/apiClient";
import { useAuth } from "@/hooks/useAuth";
import BoardArticleHeader from "./BoardArticleHeader";
import BoardArticleContent from "./BoardArticleContent";
import BoardArticleActions from "./BoardArticleActions";
import BoardComments from "./BoardComments";
import CommonLoading from "@/components/common/CommonLoading";

export default function BoardDetail({ id }) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    let cancelled = false;
    boardService
      .detail(id)
      .then((data) => {
        // sanitizeBoardDraft(data) 대신 원본 data를 그대로 저장하여
        // content 내의 /histories/96 링크 주소가 변형되지 않도록 보호합니다.
        if (!cancelled) setPost(data);
      })
      .catch((requestError) => {
        if (!cancelled) {
          setError(
            getApiErrorMessage(requestError, "게시글을 불러오지 못했습니다."),
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <CommonLoading message="게시글을 불러오는 중..." />;
  if (error || !post) {
    return (
      <div className="board-state board-state-error">
        <p>{error || "게시글을 찾을 수 없습니다."}</p>
        <Link className="btn btn-secondary" href="/boards">
          목록으로
        </Link>
      </div>
    );
  }

  const canEdit = Boolean(user && Number(user.id) === Number(post.author?.id));

  return (
    <article className="board-article">
      <Link className="board-list-link" href="/boards">
        ← 게시판 목록
      </Link>
      <BoardArticleHeader post={post} />
      <BoardArticleContent post={post} />
      <BoardArticleActions post={post} canEdit={canEdit} />
      <BoardComments boardId={post.id} />
    </article>
  );
}
