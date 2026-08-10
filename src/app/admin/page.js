"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminService } from "@/services/adminService";
import { getApiErrorMessage } from "@/services/apiClient";
import { ROUTES } from "@/constants/routes";
import ErrorMessage from "@/components/common/ErrorMessage";

const formatDate = (value) => value ? new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium" }).format(new Date(value)) : "-";

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    adminService.getDashboard()
      .then((result) => { if (!cancelled) setData(result); })
      .catch((requestError) => { if (!cancelled) setError(getApiErrorMessage(requestError, "대시보드 정보를 불러오지 못했습니다.")); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="admin-page">
      <header className="admin-page-head"><div><span className="admin-kicker">OVERVIEW</span><h1>대시보드</h1><p>Hawk-AI 서비스의 주요 운영 현황을 확인합니다.</p></div></header>
      <ErrorMessage message={error} />
      {!data && !error && <div className="admin-data-loading"><span className="admin-spinner" />운영 현황을 불러오고 있습니다.</div>}
      {data && <>
        <div className="admin-stat-grid admin-dashboard-stats">
          <article><span>전체 회원</span><strong>{data.totalUsers.toLocaleString()}</strong><small>누적 가입 계정</small></article>
          <article><span>활성 회원</span><strong>{data.activeUsers.toLocaleString()}</strong><small className="positive">정상 이용 계정</small></article>
          <article><span>이번 달 신규 회원</span><strong>{data.newUsersThisMonth.toLocaleString()}</strong><small>이번 달 가입</small></article>
          <article><span>게시글</span><strong>{data.publishedBoards.toLocaleString()}</strong><small>공개 게시글</small></article>
          <article><span>현장 점검</span><strong>{data.totalInspections.toLocaleString()}</strong><small>전체 점검 기록</small></article>
          <article><span>관리자</span><strong>{data.adminUsers.toLocaleString()}</strong><small>관리 권한 계정</small></article>
        </div>
        <section className="admin-panel">
          <div className="admin-toolbar"><div><h2>최근 가입 회원</h2><p>가장 최근에 가입한 회원입니다.</p></div><Link className="admin-text-link" href={ROUTES.adminUsers}>전체 회원 보기</Link></div>
          <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>회원</th><th>이메일</th><th>권한</th><th>상태</th><th>가입일</th></tr></thead><tbody>
            {data.recentUsers.map((member) => <tr key={member.id}><td><div className="admin-member"><span>{member.name[0]}</span><strong>{member.name}</strong></div></td><td>{member.email}</td><td><span className="role-badge">{member.role}</span></td><td><span className={`status-badge ${member.status === "ACTIVE" ? "active" : ""}`}>{member.status}</span></td><td>{formatDate(member.createdAt)}</td></tr>)}
            {!data.recentUsers.length && <tr><td colSpan="5" className="admin-empty-cell">최근 가입한 회원이 없습니다.</td></tr>}
          </tbody></table></div>
        </section>
      </>}
    </div>
  );
}
