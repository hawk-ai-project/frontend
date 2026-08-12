"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { adminService } from "@/services/adminService";
import { getApiErrorMessage } from "@/services/apiClient";
import ErrorMessage from "@/components/common/ErrorMessage";

const STATUS_LABEL = { ACTIVE: "정상", HIDDEN: "숨김", DELETED: "삭제" };
const ACTION_LABEL = { HIDE: "숨김", RESTORE: "복구", DELETE: "삭제" };
const formatDate = (value) => value ? new Intl.DateTimeFormat("ko-KR", { dateStyle: "short", timeStyle: "short" }).format(new Date(`${value}Z`)) : "-";

export default function AdminCommentsPage() {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ keyword: "", status: "", type: "" });
  const [query, setQuery] = useState({});
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setData(await adminService.getComments({ page, pageSize: 20, ...query })); }
    catch (requestError) { setError(getApiErrorMessage(requestError, "댓글 목록을 불러오지 못했습니다.")); }
    finally { setLoading(false); }
  }, [page, query]);

  useEffect(() => { const timer = window.setTimeout(() => load(), 0); return () => window.clearTimeout(timer); }, [load]);

  const search = (event) => {
    event.preventDefault(); setPage(1);
    setQuery({ keyword: filters.keyword.trim() || undefined, status: filters.status || undefined, type: filters.type || undefined });
  };
  const openDetail = async (comment) => {
    if (selected === comment.id) { setSelected(null); setDetail(null); return; }
    setSelected(comment.id); setDetail(null); setDetailLoading(true); setReason(""); setError("");
    try { setDetail(await adminService.getCommentDetail(comment.id)); }
    catch (requestError) { setError(getApiErrorMessage(requestError, "댓글 상세 정보를 불러오지 못했습니다.")); }
    finally { setDetailLoading(false); }
  };
  const moderate = async (action) => {
    const cleanReason = reason.trim();
    if (cleanReason.length < 2) { setError("관리자 조치 사유를 2자 이상 입력해 주세요."); return; }
    if (!window.confirm(`이 댓글을 ${ACTION_LABEL[action]} 처리할까요?`)) return;
    setWorking(true); setError(""); setNotice("");
    try {
      const result = await adminService.moderateComment(selected, action, cleanReason);
      setDetail(result); setReason(""); setNotice(`댓글을 ${ACTION_LABEL[action]} 처리했습니다.`); await load();
    } catch (requestError) { setError(getApiErrorMessage(requestError, "댓글 상태를 변경하지 못했습니다.")); }
    finally { setWorking(false); }
  };

  return <div className="admin-page comment-admin-page">
    <header className="admin-page-head"><div><span className="admin-kicker">MODERATION</span><h1>댓글 관리</h1><p>댓글과 대댓글의 문맥을 검토하고 운영 조치와 감사 이력을 관리합니다.</p></div></header>
    <ErrorMessage message={error} />{notice && <p className="admin-success-message" role="status">{notice}</p>}
    <section className="admin-panel"><div className="admin-toolbar comment-admin-toolbar"><div><h2>전체 댓글</h2><p>{data ? `총 ${data.totalItems.toLocaleString()}개의 댓글` : "댓글을 조회합니다."}</p></div><form className="comment-admin-filters" onSubmit={search}><select aria-label="댓글 유형" value={filters.type} onChange={(event) => setFilters((current) => ({ ...current, type: event.target.value }))}><option value="">전체 유형</option><option value="COMMENT">댓글</option><option value="REPLY">대댓글</option></select><select aria-label="댓글 상태" value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}><option value="">전체 상태</option><option value="ACTIVE">정상</option><option value="HIDDEN">숨김</option><option value="DELETED">삭제</option></select><input type="search" value={filters.keyword} onChange={(event) => setFilters((current) => ({ ...current, keyword: event.target.value }))} placeholder="내용, 작성자, 게시글" /><button type="submit">검색</button></form></div>
      {loading ? <div className="admin-data-loading"><span className="admin-spinner" />댓글을 불러오고 있습니다.</div> : <div className="admin-table-wrap"><table className="admin-table comment-admin-table"><thead><tr><th>댓글</th><th>게시글</th><th>작성자</th><th>유형</th><th>상태</th><th>작성일</th><th /></tr></thead><tbody>{(data?.items || []).map((comment) => <CommentRows comment={comment} selected={selected === comment.id} detail={detail} detailLoading={detailLoading} reason={reason} setReason={setReason} working={working} onOpen={() => openDetail(comment)} onModerate={moderate} key={comment.id} />)}{data && !data.items.length && <tr><td colSpan="7" className="admin-empty-cell">조건에 맞는 댓글이 없습니다.</td></tr>}</tbody></table></div>}
      {data && data.totalPages > 1 && <nav className="admin-pagination" aria-label="댓글 페이지"><button type="button" disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)}>이전</button><span>{page} / {data.totalPages}</span><button type="button" disabled={page >= data.totalPages || loading} onClick={() => setPage((value) => value + 1)}>다음</button></nav>}
    </section>
  </div>;
}

function CommentRows({ comment, selected, detail, detailLoading, reason, setReason, working, onOpen, onModerate }) {
  return <>
    <tr className={`comment-admin-row${selected ? " selected" : ""}`}><td><div className="comment-admin-content"><strong>{comment.content || `[이모티콘: ${comment.emoticon}]`}</strong><small>#{comment.id}{comment.replyCount ? ` · 답글 ${comment.replyCount}개` : ""}</small></div></td><td><Link href={`/boards/${comment.boardId}`} target="_blank">{comment.boardTitle}</Link></td><td><div className="activity-actor"><strong>{comment.authorName}</strong><small>{comment.authorEmail}</small></div></td><td>{comment.parentId ? "대댓글" : "댓글"}</td><td><span className={`comment-status status-${comment.status.toLowerCase()}`}>{STATUS_LABEL[comment.status]}</span></td><td>{formatDate(comment.createdAt)}</td><td><button type="button" className="comment-review-btn" onClick={onOpen}>{selected ? "닫기" : "검토"}</button></td></tr>
    {selected && <tr className="comment-review-row"><td colSpan="7">{detailLoading ? <div className="admin-data-loading"><span className="admin-spinner" />댓글 문맥을 불러오고 있습니다.</div> : detail && <div className="comment-review-grid"><section><h3>댓글 문맥</h3><Link href={`/boards/${detail.comment.boardId}`} target="_blank" className="comment-context-board">{detail.comment.boardTitle} ↗</Link>{detail.comment.parentContent && <blockquote><small>부모 댓글</small>{detail.comment.parentContent}</blockquote>}<div className="comment-context-current"><small>{detail.comment.parentId ? "대댓글" : "댓글"} · {detail.comment.authorName}</small><p>{detail.comment.content}</p></div><label className="comment-reason"><span>관리자 조치 사유</span><textarea maxLength="500" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="사용자와 감사 기록에 남길 조치 사유를 입력하세요." /></label><div className="comment-moderation-actions">{detail.comment.status !== "HIDDEN" && <button type="button" disabled={working} onClick={() => onModerate("HIDE")}>숨김</button>}{detail.comment.status !== "ACTIVE" && <button type="button" className="restore" disabled={working} onClick={() => onModerate("RESTORE")}>복구</button>}{detail.comment.status !== "DELETED" && <button type="button" className="delete" disabled={working} onClick={() => onModerate("DELETE")}>삭제</button>}</div></section><section><h3>작성자의 최근 댓글</h3><div className="comment-related-list">{detail.authorRecentComments.map((item) => <div key={item.id}><span><b>{item.content}</b><small>{item.boardTitle} · {formatDate(item.createdAt)}</small></span><i className={`status-${item.status.toLowerCase()}`}>{STATUS_LABEL[item.status]}</i></div>)}{!detail.authorRecentComments.length && <p>다른 댓글이 없습니다.</p>}</div><h3>관리 조치 이력</h3><div className="comment-history-list">{detail.history.map((item) => <div key={item.id}><span><b>{ACTION_LABEL[item.action]}</b><small>{item.moderatorName || "알 수 없는 관리자"} · {formatDate(item.createdAt)}</small></span><p>{item.reason}</p></div>)}{!detail.history.length && <p>관리 조치 이력이 없습니다.</p>}</div></section></div>}</td></tr>}
  </>;
}
