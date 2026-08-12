"use client";

import { useCallback, useEffect, useState } from "react";
import { adminService } from "@/services/adminService";
import { getApiErrorMessage } from "@/services/apiClient";
import ErrorMessage from "@/components/common/ErrorMessage";

const STATUS_LABEL = { ACTIVE: "활성", EXPIRED: "만료", REVOKED: "종료" };
const formatDateTime = (value) => value ? new Intl.DateTimeFormat("ko-KR", { dateStyle: "short", timeStyle: "short" }).format(new Date(`${value}Z`)) : "-";

export default function AdminSecurityPage() {
  const [overview, setOverview] = useState(null);
  const [sessions, setSessions] = useState(null);
  const [settings, setSettings] = useState(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ keyword: "", status: "ACTIVE" });
  const [query, setQuery] = useState({ status: "ACTIVE" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [workingId, setWorkingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const [overviewResult, sessionResult, settingsResult] = await Promise.all([
        adminService.getSecurityOverview(),
        adminService.getSecuritySessions({ page, pageSize: 20, ...query }),
        adminService.getSettings(),
      ]);
      setOverview(overviewResult); setSessions(sessionResult); setSettings(settingsResult);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "세션 및 보안 정보를 불러오지 못했습니다."));
    } finally { setLoading(false); }
  }, [page, query]);

  useEffect(() => {
    const timer = window.setTimeout(() => load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const search = (event) => {
    event.preventDefault(); setPage(1);
    setQuery({ keyword: filters.keyword.trim() || undefined, status: filters.status || undefined });
  };
  const savePolicy = async () => {
    setSaving(true); setError(""); setNotice("");
    try { setSettings(await adminService.updateSettings(settings)); setNotice("세션 정책을 저장했습니다. 새 로그인부터 적용됩니다."); }
    catch (requestError) { setError(getApiErrorMessage(requestError, "세션 정책을 저장하지 못했습니다.")); }
    finally { setSaving(false); }
  };
  const revoke = async (session) => {
    if (!window.confirm(`${session.userName} 사용자의 세션을 종료할까요?`)) return;
    setWorkingId(session.id); setError(""); setNotice("");
    try { const result = await adminService.revokeSecuritySession(session.id); setNotice(result.message); await load(); }
    catch (requestError) { setError(getApiErrorMessage(requestError, "세션을 종료하지 못했습니다.")); }
    finally { setWorkingId(""); }
  };
  const revokeAll = async () => {
    if (!window.confirm("현재 관리자 세션을 제외한 모든 활성 세션을 종료할까요?")) return;
    setWorkingId("all"); setError(""); setNotice("");
    try { const result = await adminService.revokeAllSecuritySessions(true); setNotice(result.message); await load(); }
    catch (requestError) { setError(getApiErrorMessage(requestError, "전체 세션을 종료하지 못했습니다.")); }
    finally { setWorkingId(""); }
  };

  return <div className="admin-page security-page">
    <header className="admin-page-head"><div><span className="admin-kicker">SECURITY</span><h1>세션 및 보안</h1><p>로그인 세션의 수명과 접속 기기를 확인하고 위험한 세션을 종료합니다.</p></div><button type="button" className="security-danger-btn" disabled={workingId === "all"} onClick={revokeAll}>{workingId === "all" ? "종료 중..." : "전체 활성 세션 종료"}</button></header>
    <ErrorMessage message={error} />{notice && <p className="admin-success-message" role="status">{notice}</p>}
    {loading && !overview && <div className="admin-data-loading"><span className="admin-spinner" />보안 현황을 불러오고 있습니다.</div>}
    {overview && <div className="admin-stat-grid security-stat-grid"><article><span>활성 세션</span><strong>{overview.activeSessions.toLocaleString()}</strong><small>현재 유효한 로그인</small></article><article><span>접속 사용자</span><strong>{overview.activeUsers.toLocaleString()}</strong><small>고유 사용자</small></article><article><span>1시간 내 만료</span><strong>{overview.expiringSoon.toLocaleString()}</strong><small>곧 종료될 세션</small></article><article><span>24시간 내 종료</span><strong>{overview.revoked24h.toLocaleString()}</strong><small>관리자·사용자 종료</small></article><article><span>로그인 실패</span><strong>{overview.failedLogins24h.toLocaleString()}</strong><small>최근 24시간</small></article><article><span>접근 거부</span><strong>{overview.deniedRequests24h.toLocaleString()}</strong><small>401 · 403 응답</small></article></div>}
    {settings && <section className="admin-panel security-policy-panel"><div className="admin-toolbar"><div><h2>세션 만료 정책</h2><p>정책 변경은 새로 로그인하는 세션부터 적용됩니다. 기존 세션의 만료 시각은 변경되지 않습니다.</p></div></div><div className="security-policy-body"><label><span><strong>세션 유지 시간</strong><small>인증 토큰과 서버 세션이 유지되는 최대 시간입니다.</small></span><select value={settings.sessionExpireMinutes} onChange={(event) => setSettings((current) => ({ ...current, sessionExpireMinutes: Number(event.target.value) }))}><option value="30">30분</option><option value="60">1시간</option><option value="480">8시간</option><option value="1440">24시간</option></select></label><button type="button" className="admin-primary-btn" disabled={saving} onClick={savePolicy}>{saving ? "저장 중..." : "정책 저장"}</button></div></section>}
    <section className="admin-panel security-session-panel"><div className="admin-toolbar security-session-toolbar"><div><h2>접속 세션</h2><p>IP와 브라우저 정보를 확인하고 의심스러운 로그인을 즉시 종료할 수 있습니다.</p></div><form className="security-session-filters" onSubmit={search}><select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}><option value="ACTIVE">활성</option><option value="EXPIRED">만료</option><option value="REVOKED">종료</option><option value="">전체</option></select><input value={filters.keyword} onChange={(event) => setFilters((current) => ({ ...current, keyword: event.target.value }))} placeholder="이름, 이메일, IP" /><button type="submit">조회</button></form></div><div className="admin-table-wrap"><table className="admin-table security-session-table"><thead><tr><th>사용자</th><th>접속 환경</th><th>IP</th><th>로그인</th><th>최근 사용</th><th>만료</th><th>상태</th><th /></tr></thead><tbody>{(sessions?.items || []).map((session) => <tr key={session.id}><td><div className="activity-actor"><strong>{session.userName}</strong><small>{session.userEmail} · {session.userRole}</small></div></td><td><div className="security-device"><strong>{describeUserAgent(session.userAgent)}</strong><small title={session.userAgent || ""}>{session.userAgent || "정보 없음"}</small></div></td><td><code>{session.ipAddress || "-"}</code></td><td>{formatDateTime(session.createdAt)}</td><td>{formatDateTime(session.lastUsedAt)}</td><td>{formatDateTime(session.expiresAt)}</td><td><span className={`security-session-status status-${session.status.toLowerCase()}`}>{STATUS_LABEL[session.status]}</span></td><td>{session.status === "ACTIVE" && <button type="button" className="security-revoke-btn" disabled={workingId === session.id} onClick={() => revoke(session)}>{workingId === session.id ? "종료 중" : "종료"}</button>}</td></tr>)}{sessions && !sessions.items.length && <tr><td colSpan="8" className="admin-empty-cell">조건에 맞는 세션이 없습니다.</td></tr>}</tbody></table></div>{sessions && sessions.totalPages > 1 && <div className="admin-pagination"><button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>이전</button><span>{page} / {sessions.totalPages} · 총 {sessions.totalItems.toLocaleString()}개</span><button type="button" disabled={page >= sessions.totalPages} onClick={() => setPage((value) => value + 1)}>다음</button></div>}</section>
  </div>;
}

function describeUserAgent(value) {
  const userAgent = value || "";
  const browser = userAgent.includes("Edg/") ? "Edge" : userAgent.includes("Chrome/") ? "Chrome" : userAgent.includes("Firefox/") ? "Firefox" : userAgent.includes("Safari/") ? "Safari" : "기타 브라우저";
  const os = userAgent.includes("Windows") ? "Windows" : userAgent.includes("Android") ? "Android" : userAgent.includes("iPhone") || userAgent.includes("iPad") ? "iOS/iPadOS" : userAgent.includes("Mac OS") ? "macOS" : userAgent.includes("Linux") ? "Linux" : "기타 OS";
  return userAgent ? `${browser} · ${os}` : "정보 없음";
}
