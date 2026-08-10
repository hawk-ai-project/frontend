"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { adminService } from "@/services/adminService";
import { getApiErrorMessage } from "@/services/apiClient";


function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date(value));
}

export default function AdminBoardsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [workingId, setWorkingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await adminService.getBoards({
        page,
        pageSize: 20,
        keyword: query || undefined,
        status: status || undefined,
      });
      setData(result);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "게시글 목록을 불러오지 못했습니다."));
    } finally {
      setLoading(false);
    }
  }, [page, query, status]);

  useEffect(() => {
    let cancelled = false;
    adminService.getBoards({
      page,
      pageSize: 20,
      keyword: query || undefined,
      status: status || undefined,
    })
      .then((result) => { if (!cancelled) setData(result); })
      .catch((requestError) => {
        if (!cancelled) setError(getApiErrorMessage(requestError, "게시글 목록을 불러오지 못했습니다."));
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, query, status]);

  const search = (event) => {
    event.preventDefault();
    setPage(1);
    setQuery(keyword.trim());
  };

  const changeStatus = async (boardId, nextStatus) => {
    setWorkingId(boardId);
    setError("");
    try {
      await adminService.updateBoardStatus(boardId, nextStatus);
      await load();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "게시글 상태를 변경하지 못했습니다."));
    } finally {
      setWorkingId(null);
    }
  };

  const remove = async (board) => {
    if (!window.confirm(`“${board.title}” 게시글을 삭제하시겠습니까?`)) return;
    setWorkingId(board.id);
    setError("");
    try {
      await adminService.deleteBoard(board.id);
      if (data?.items.length === 1 && page > 1) setPage((value) => value - 1);
      else await load();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "게시글을 삭제하지 못했습니다."));
    } finally {
      setWorkingId(null);
    }
  };

  const items = data?.items ?? [];

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div><span className="admin-kicker">CONTENT</span><h1>게시글 관리</h1><p>게시글의 공개 상태를 변경하거나 부적절한 게시글을 삭제합니다.</p></div>
        <Link className="admin-primary-btn admin-button-link" href="/boards/write">게시글 작성</Link>
      </header>

      {error && <p className="admin-error-message" role="alert">{error}</p>}

      <section className="admin-panel">
        <div className="admin-toolbar">
          <div><h2>전체 게시글</h2><p>{data ? `총 ${data.totalItems.toLocaleString()}개의 게시글` : "게시글을 조회합니다."}</p></div>
          <div className="admin-board-filters">
            <select aria-label="게시 상태 필터" value={status} onChange={(event) => { setLoading(true); setStatus(event.target.value); setPage(1); }}>
              <option value="">전체 상태</option>
              <option value="PUBLISHED">공개</option>
              <option value="HIDDEN">숨김</option>
              <option value="DRAFT">초안</option>
            </select>
            <form className="admin-search-form" onSubmit={search}>
              <input type="search" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="제목 또는 작성자 검색" aria-label="게시글 검색" />
              <button type="submit">검색</button>
            </form>
          </div>
        </div>

        {loading ? <div className="admin-data-loading"><span className="admin-spinner" />게시글을 불러오고 있습니다.</div> : (
          <div className="admin-table-wrap">
            <table className="admin-table admin-board-table">
              <thead><tr><th>게시글</th><th>카테고리</th><th>작성자</th><th>상태</th><th>조회</th><th>작성일</th><th>관리</th></tr></thead>
              <tbody>
                {items.map((board) => (
                  <tr key={board.id}>
                    <td><div className="admin-board-title"><strong>{board.title}</strong><small>#{board.id}{board.isNotice ? " · 공지" : ""}</small></div></td>
                    <td>{board.category}</td>
                    <td>{board.authorName}</td>
                    <td><select className={`admin-status-select status-${board.status.toLowerCase()}`} value={board.status} disabled={workingId === board.id} onChange={(event) => changeStatus(board.id, event.target.value)} aria-label={`${board.title} 상태`}><option value="PUBLISHED">공개</option><option value="HIDDEN">숨김</option><option value="DRAFT">초안</option></select></td>
                    <td>{board.viewCount.toLocaleString()}</td>
                    <td>{formatDate(board.createdAt)}</td>
                    <td><div className="admin-row-actions">{board.status === "PUBLISHED" && <Link href={`/boards/${board.id}`} target="_blank">보기</Link>}<button type="button" disabled={workingId === board.id} onClick={() => remove(board)}>삭제</button></div></td>
                  </tr>
                ))}
                {!items.length && <tr><td colSpan="7" className="admin-empty-cell">조건에 맞는 게시글이 없습니다.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {data && data.totalPages > 1 && <nav className="admin-pagination" aria-label="게시글 페이지"><button type="button" disabled={page <= 1 || loading} onClick={() => { setLoading(true); setPage((value) => value - 1); }}>이전</button><span>{page} / {data.totalPages}</span><button type="button" disabled={page >= data.totalPages || loading} onClick={() => { setLoading(true); setPage((value) => value + 1); }}>다음</button></nav>}
      </section>
    </div>
  );
}