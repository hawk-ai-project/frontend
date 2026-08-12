"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { boardService } from "@/services/boardService";

const EMOTICONS = Array.from({ length: 30 }, (_, index) => String(index + 1).padStart(2, "0"));

function emoticonUrl(name) {
  return `/images/emoticons/${name}.png`;
}

function CommentEditor({ compact = false, initial = {}, onCancel, onSubmit }) {
  const [content, setContent] = useState(initial.content || "");
  const [emoticon, setEmoticon] = useState(initial.emoticon || null);
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!content.trim() && !emoticon) return;
    setSaving(true);
    try {
      await onSubmit({ content: content.trim(), emoticon });
      setContent("");
      setEmoticon(null);
      setShowPicker(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className={`comment-editor${compact ? " is-compact" : ""}`} onSubmit={submit}>
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        maxLength={1000}
        placeholder={compact ? "답글을 입력하세요" : "댓글을 입력하세요"}
        aria-label={compact ? "답글 내용" : "댓글 내용"}
      />
      {emoticon && (
        <div className="comment-selected-emoticon">
          <Image src={emoticonUrl(emoticon)} alt="선택한 이모티콘" width={72} height={72} />
          <button type="button" onClick={() => setEmoticon(null)} aria-label="이모티콘 선택 취소">×</button>
        </div>
      )}
      {showPicker && (
        <div className="comment-emoticon-picker" aria-label="이모티콘 선택">
          {EMOTICONS.map((name) => (
            <button type="button" key={name} onClick={() => { setEmoticon(name); setShowPicker(false); }}>
              <Image src={emoticonUrl(name)} alt={`이모티콘 ${Number(name)}`} width={48} height={48} />
            </button>
          ))}
        </div>
      )}
      <div className="comment-editor-actions">
        <button className="comment-emoticon-button" type="button" onClick={() => setShowPicker((value) => !value)}>
          😊 이모티콘
        </button>
        <span>{content.length}/1000</span>
        {onCancel && <button className="btn btn-secondary" type="button" onClick={onCancel}>취소</button>}
        <button className="btn btn-primary" type="submit" disabled={saving || (!content.trim() && !emoticon)}>
          {saving ? "저장 중" : compact ? "답글 등록" : "댓글 등록"}
        </button>
      </div>
    </form>
  );
}

function CommentItem({ comment, currentUserId, onCreateReply, onUpdate, onDelete }) {
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [repliesExpanded, setRepliesExpanded] = useState(true);
  const mine = !comment.isHidden && Number(currentUserId) === Number(comment.author.id);
  const date = new Date(comment.createdAt).toLocaleString("ko-KR", { dateStyle: "medium", timeStyle: "short" });

  return (
    <div className={`board-comment${comment.parentId ? " is-reply" : ""}`}>
      <div className="comment-avatar" aria-hidden="true">
        {comment.author.profileImageUrl
          ? <Image src={comment.author.profileImageUrl} alt="" fill sizes="40px" unoptimized />
          : comment.author.name.charAt(0)}
      </div>
      <div className="comment-body">
        <div className="comment-head"><strong>{comment.author.name}</strong><time>{date}</time></div>
        {editing ? (
          <CommentEditor compact initial={comment} onCancel={() => setEditing(false)} onSubmit={async (payload) => { await onUpdate(comment.id, payload); setEditing(false); }} />
        ) : (
          <>
            {comment.isHidden
              ? <p className="comment-hidden-notice" role="status">관리자에 의해 숨김 처리된 댓글입니다.</p>
              : comment.content && <p>{comment.content}</p>}
            {comment.emoticon && <Image className="comment-emoticon" src={emoticonUrl(comment.emoticon)} alt="댓글 이모티콘" width={96} height={96} />}
            <div className="comment-actions">
              {!comment.isHidden && !comment.parentId && currentUserId && <button type="button" onClick={() => setReplying((value) => !value)}>답글</button>}
              {mine && <button type="button" onClick={() => setEditing(true)}>수정</button>}
              {mine && <button type="button" onClick={() => onDelete(comment.id)}>삭제</button>}
            </div>
          </>
        )}
        {replying && <CommentEditor compact onCancel={() => setReplying(false)} onSubmit={async (payload) => { await onCreateReply(comment.id, payload); setReplying(false); }} />}
        {comment.replies?.length > 0 && (
          <>
            <button
              className="comment-replies-toggle"
              type="button"
              onClick={() => setRepliesExpanded((value) => !value)}
              aria-expanded={repliesExpanded}
            >
              <span aria-hidden="true">{repliesExpanded ? "▾" : "▸"}</span>
              답글 {comment.replies.length}개 {repliesExpanded ? "접기" : "펼치기"}
            </button>
            {repliesExpanded && (
              <div className="comment-replies">
                {comment.replies.map((reply) => <CommentItem key={reply.id} comment={reply} currentUserId={currentUserId} onUpdate={onUpdate} onDelete={onDelete} />)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function BoardComments({ boardId, resourceId = boardId, commentService = boardService }) {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState("newest");

  const load = useCallback(async () => {
    try {
      setComments(await commentService.comments(resourceId));
    } catch {
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [commentService, resourceId]);

  useEffect(() => {
    let cancelled = false;
    commentService.comments(resourceId)
      .then((items) => {
        if (!cancelled) setComments(items);
      })
      .catch(() => {
        if (!cancelled) setComments([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [commentService, resourceId]);

  const run = async (request) => {
    try {
      await request();
      await load();
    } catch (requestError) {
      throw requestError;
    }
  };

  const count = comments.reduce((total, comment) => total + 1 + (comment.replies?.length || 0), 0);
  const sortedComments = useMemo(
    () => [...comments].sort((left, right) => {
      const difference = new Date(right.createdAt) - new Date(left.createdAt);
      return sortOrder === "newest" ? difference : -difference;
    }),
    [comments, sortOrder],
  );

  return (
    <section className="board-comments" aria-labelledby="board-comments-title">
      <div className="board-comments-head">
        <h2 id="board-comments-title">댓글 <span>{count}</span></h2>
        <label>
          <span className="sr-only">댓글 정렬</span>
          <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
            <option value="newest">최신순</option>
            <option value="oldest">오래된순</option>
          </select>
        </label>
      </div>
      {isAuthenticated
        ? <CommentEditor onSubmit={(payload) => run(() => commentService.createComment(resourceId, payload))} />
        : <p className="comment-login-notice"><Link href="/login">로그인</Link>하면 댓글과 이모티콘을 남길 수 있습니다.</p>}
      {loading && <p className="board-state">댓글을 불러오는 중입니다.</p>}
      {!loading && comments.length === 0 && <p className="comment-empty">첫 댓글을 남겨보세요.</p>}
      <div className="comment-list">
        {sortedComments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            currentUserId={user?.id}
            onCreateReply={(parentId, payload) => run(() => commentService.createComment(resourceId, { ...payload, parentId }))}
            onUpdate={(commentId, payload) => run(() => commentService.updateComment(commentId, payload))}
            onDelete={(commentId) => {
              if (window.confirm("댓글을 삭제할까요? 대댓글이 있으면 함께 삭제됩니다.")) return run(() => commentService.removeComment(commentId));
            }}
          />
        ))}
      </div>
    </section>
  );
}
