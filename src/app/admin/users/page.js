"use client";

import { useEffect, useState } from "react";
import { adminService } from "@/services/adminService";
import { getApiErrorMessage } from "@/services/apiClient";
import ErrorMessage from "@/components/common/ErrorMessage";

const formatDate = (value) => value ? new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium" }).format(new Date(value)) : "-";

export default function AdminUsersPage() {
  const [data, setData] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    adminService.getUsers({ page: 1, pageSize: 100 })
      .then((result) => { if (!cancelled) setData(result); })
      .catch((requestError) => { if (!cancelled) setError(getApiErrorMessage(requestError, "회원 목록을 불러오지 못했습니다.")); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);
  const search = async (event) => {
    event.preventDefault(); setLoading(true); setError("");
    try { setData(await adminService.getUsers({ page: 1, pageSize: 100, keyword: keyword.trim() || undefined })); }
    catch (requestError) { setError(getApiErrorMessage(requestError, "회원 목록을 불러오지 못했습니다.")); }
    finally { setLoading(false); }
  };
  const users = data?.items || [];
  const activeCount = users.filter((member) => member.status === "ACTIVE").length;
  const adminCount = users.filter((member) => member.role === "ADMIN").length;

  return (
    <div className="admin-page">
      <header className="admin-page-head"><div><span className="admin-kicker">MEMBERS</span><h1>회원 관리</h1><p>실제 데이터베이스에 등록된 회원과 계정 상태를 조회합니다.</p></div></header>
      <div className="admin-stat-grid"><article><span>조회된 회원</span><strong>{data?.totalItems ?? "-"}</strong><small>검색 결과</small></article><article><span>활성 회원</span><strong>{data ? activeCount : "-"}</strong><small className="positive">현재 목록 기준</small></article><article><span>관리자</span><strong>{data ? adminCount : "-"}</strong><small>현재 목록 기준</small></article></div>
      <ErrorMessage message={error} />
      <section className="admin-panel">
        <div className="admin-toolbar"><div><h2>회원 목록</h2><p>DB의 users 및 roles 테이블을 조회합니다.</p></div><form className="admin-search-form" onSubmit={search}><input type="search" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="이름 또는 이메일 검색" aria-label="회원 검색" /><button type="submit">검색</button></form></div>
        {loading ? <div className="admin-data-loading"><span className="admin-spinner" />회원 정보를 불러오고 있습니다.</div> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>회원</th><th>이메일</th><th>권한</th><th>상태</th><th>최근 로그인</th><th>가입일</th></tr></thead><tbody>
          {users.map((member) => <tr key={member.id}><td><div className="admin-member"><span>{member.name[0]}</span><strong>{member.name}</strong></div></td><td>{member.email}</td><td><span className="role-badge">{member.role}</span></td><td><span className={`status-badge ${member.status === "ACTIVE" ? "active" : ""}`}>{member.status}</span></td><td>{formatDate(member.lastLoginAt)}</td><td>{formatDate(member.createdAt)}</td></tr>)}
          {!users.length && <tr><td colSpan="6" className="admin-empty-cell">조회된 회원이 없습니다.</td></tr>}
        </tbody></table></div>}
      </section>
    </div>
  );
}
