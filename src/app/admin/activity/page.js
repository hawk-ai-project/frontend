"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { adminService } from "@/services/adminService";
import { getApiErrorMessage } from "@/services/apiClient";
import ErrorMessage from "@/components/common/ErrorMessage";

const CATEGORIES = ["AUTH", "BOARD", "INSPECTION", "ANALYTICS", "ADMIN", "CHAT", "FILE", "SYSTEM"];
const OUTCOME_LABELS = { SUCCESS: "성공", DENIED: "거부", FAILURE: "실패" };
const formatNumber = (value) => Number(value || 0).toLocaleString("ko-KR");
const formatDateTime = (value) => value
  ? new Intl.DateTimeFormat("ko-KR", { dateStyle: "short", timeStyle: "medium" }).format(new Date(`${value}Z`))
  : "-";

export default function AdminActivityPage() {
  const [overview, setOverview] = useState(null);
  const [monitoring, setMonitoring] = useState(null);
  const [logs, setLogs] = useState(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ category: "", outcome: "", keyword: "" });
  const [query, setQuery] = useState({});
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const load = useCallback(async ({ quiet = false } = {}) => {
    if (!quiet) setLoading(true);
    setError("");
    try {
      const [overviewResult, logResult, monitoringResult] = await Promise.all([
        adminService.getActivityOverview({ hours: 24 }),
        adminService.getActivityLogs({ page, pageSize: 30, ...query }),
        adminService.getMonitoringOverview(),
      ]);
      setOverview(overviewResult);
      setLogs(logResult);
      setMonitoring(monitoringResult);
      setLastUpdated(new Date());
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "활동 로그를 불러오지 못했습니다."));
    } finally {
      if (!quiet) setLoading(false);
    }
  }, [page, query]);

  useEffect(() => {
    const initialTimer = window.setTimeout(() => load(), 0);
    const timer = window.setInterval(() => load({ quiet: true }), 30000);
    return () => { window.clearTimeout(initialTimer); window.clearInterval(timer); };
  }, [load]);

  const maxTrend = useMemo(
    () => Math.max(1, ...(overview?.trend || []).map((point) => point.total)),
    [overview],
  );

  const applyFilters = (event) => {
    event.preventDefault();
    setPage(1);
    setQuery({
      category: filters.category || undefined,
      outcome: filters.outcome || undefined,
      keyword: filters.keyword.trim() || undefined,
    });
  };

  const applyPreset = (preset) => {
    const next = preset === "access" ? { category: "AUTH", outcome: "", keyword: "" }
      : preset === "audit" ? { category: "ADMIN", outcome: "", keyword: "" }
      : preset === "events" ? { category: "INSPECTION", outcome: "", keyword: "" }
      : preset === "errors" ? { category: "", outcome: "FAILURE", keyword: "" }
      : { category: "", outcome: "", keyword: "" };
    setFilters(next);
    setQuery({ category: next.category || undefined, outcome: next.outcome || undefined, keyword: undefined });
    setPage(1);
  };

  return (
    <div className="admin-page activity-page">
      <header className="admin-page-head">
        <div><span className="admin-kicker">OBSERVABILITY</span><h1>사용자 활동 모니터링</h1><p>서비스 요청, 사용자 행동, 오류와 접근 거부를 실시간으로 추적합니다.</p></div>
        <div className="activity-refresh"><small>{lastUpdated ? `최근 갱신 ${lastUpdated.toLocaleTimeString("ko-KR")}` : ""}</small><button type="button" onClick={() => load()}>새로고침</button></div>
      </header>
      <ErrorMessage message={error} />
      <nav className="monitor-section-nav" aria-label="모니터링 영역">
        {[["overview", "운영 요약"], ["system", "시스템·서비스"], ["security", "알림·보안"], ["logs", "활동·감사 로그"], ["reports", "통계·리포트"], ["settings", "모니터링 설정"]].map(([key, label]) => <button type="button" className={activeTab === key ? "active" : ""} onClick={() => setActiveTab(key)} key={key}>{label}</button>)}
      </nav>
      {loading && !overview && <div className="admin-data-loading"><span className="admin-spinner" />활동 현황을 불러오고 있습니다.</div>}
      {overview && activeTab === "overview" && <>
        <div className="admin-stat-grid activity-stat-grid" id="monitor-dashboard">
          <article><span>24시간 요청</span><strong>{formatNumber(overview.totalEvents)}</strong><small>API 활동 전체</small></article>
          <article><span>활성 사용자</span><strong>{formatNumber(overview.activeUsers)}</strong><small>고유 인증 사용자</small></article>
          <article><span>실패율</span><strong className={overview.errorRate > 5 ? "metric-danger" : ""}>{overview.errorRate.toFixed(2)}%</strong><small>{formatNumber(overview.failedEvents)}건 실패</small></article>
          <article><span>접근 거부</span><strong>{formatNumber(overview.deniedEvents)}</strong><small>401 · 403 응답</small></article>
          <article><span>평균 응답</span><strong>{formatNumber(overview.averageDurationMs)}<em>ms</em></strong><small>최대 {formatNumber(overview.maxDurationMs)}ms</small></article>
        </div>

        <div className="activity-overview-grid">
          <section className="admin-panel activity-chart-panel">
            <div className="admin-toolbar"><div><h2>시간대별 요청 추이</h2><p>최근 24시간 요청량과 실패 요청입니다.</p></div></div>
            <div className="activity-chart" aria-label="시간대별 요청량 막대 차트">
              {overview.trend.map((point) => (
                <div className="activity-chart-column" key={point.bucket} title={`${formatDateTime(point.bucket)} · ${point.total}건`}>
                  <div className="activity-chart-bars">
                    <span className="activity-chart-total" style={{ height: `${Math.max(4, point.total / maxTrend * 100)}%` }} />
                    {point.failures > 0 && <span className="activity-chart-failure" style={{ height: `${Math.max(4, point.failures / maxTrend * 100)}%` }} />}
                  </div>
                  <small>{new Date(`${point.bucket}Z`).getHours()}시</small>
                </div>
              ))}
              {!overview.trend.length && <div className="activity-empty">집계된 활동이 없습니다.</div>}
            </div>
          </section>
          <section className="admin-panel activity-top-panel">
            <div className="admin-toolbar"><div><h2>주요 활동</h2><p>요청 빈도가 높은 활동입니다.</p></div></div>
            <div className="activity-top-list">
              {overview.topActions.map((item) => (
                <div key={`${item.category}-${item.action}`}><span><b>{item.action}</b><small>{item.category}</small></span><strong>{formatNumber(item.count)}</strong></div>
              ))}
              {!overview.topActions.length && <div className="activity-empty">집계된 활동이 없습니다.</div>}
            </div>
          </section>
        </div>
      </>}

      {monitoring && <MonitoringSections activeTab={activeTab} data={monitoring} onSettingsSaved={(settings) => setMonitoring((current) => ({ ...current, settings }))} />}

      {activeTab === "logs" && <section className="admin-panel activity-log-panel" id="monitor-logs">
        <div className="admin-toolbar activity-log-toolbar">
          <div><h2>감사 로그</h2><p>기본 조회 범위는 최근 7일이며 30초마다 자동 갱신됩니다.</p></div>
          <div className="activity-filter-area"><div className="activity-presets"><button type="button" onClick={() => applyPreset("all")}>전체 활동</button><button type="button" onClick={() => applyPreset("access")}>접속 기록</button><button type="button" onClick={() => applyPreset("audit")}>감사 로그</button><button type="button" onClick={() => applyPreset("events")}>이벤트</button><button type="button" onClick={() => applyPreset("errors")}>에러</button></div><form className="activity-filters" onSubmit={applyFilters}>
            <select aria-label="활동 분류" value={filters.category} onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}>
              <option value="">전체 분류</option>{CATEGORIES.map((category) => <option key={category}>{category}</option>)}
            </select>
            <select aria-label="처리 결과" value={filters.outcome} onChange={(event) => setFilters((current) => ({ ...current, outcome: event.target.value }))}>
              <option value="">전체 결과</option><option value="SUCCESS">성공</option><option value="DENIED">거부</option><option value="FAILURE">실패</option>
            </select>
            <input aria-label="활동 검색" value={filters.keyword} onChange={(event) => setFilters((current) => ({ ...current, keyword: event.target.value }))} placeholder="사용자, 경로, 요청 ID" />
            <button type="submit">조회</button>
          </form></div>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table activity-table"><thead><tr><th>발생 시각</th><th>사용자</th><th>활동</th><th>경로</th><th>결과</th><th>응답시간</th></tr></thead><tbody>
            {(logs?.items || []).map((item) => (
              <ActivityRow item={item} expanded={selectedId === item.id} onToggle={() => setSelectedId((current) => current === item.id ? null : item.id)} key={item.id} />
            ))}
            {logs && !logs.items.length && <tr><td colSpan="6" className="admin-empty-cell">조건에 맞는 활동 로그가 없습니다.</td></tr>}
          </tbody></table>
        </div>
        {logs && logs.totalPages > 1 && <div className="admin-pagination"><button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>이전</button><span>{page} / {logs.totalPages} · 총 {formatNumber(logs.totalItems)}건</span><button type="button" disabled={page >= logs.totalPages} onClick={() => setPage((value) => value + 1)}>다음</button></div>}
      </section>}
    </div>
  );
}

function ActivityRow({ item, expanded, onToggle }) {
  return <>
    <tr className="activity-row" onClick={onToggle} aria-expanded={expanded}>
      <td className="activity-time">{formatDateTime(item.occurredAt)}</td>
      <td><div className="activity-actor"><strong>{item.userName || "비인증 요청"}</strong><small>{item.userEmail || item.ipAddress || "-"}</small></div></td>
      <td><div className="activity-action"><strong>{item.action}</strong><small>{item.category} · {item.httpMethod}</small></div></td>
      <td><code>{item.routeTemplate || item.path}</code></td>
      <td><span className={`activity-outcome outcome-${item.outcome.toLowerCase()}`}>{OUTCOME_LABELS[item.outcome]}</span><small className="activity-status-code">{item.statusCode}</small></td>
      <td>{formatNumber(item.durationMs)}ms</td>
    </tr>
    {expanded && <tr className="activity-detail-row"><td colSpan="6"><dl><div><dt>요청 ID</dt><dd>{item.requestId}</dd></div><div><dt>IP 주소</dt><dd>{item.ipAddress || "-"}</dd></div><div><dt>브라우저/OS</dt><dd>{describeUserAgent(item.userAgent)}</dd></div><div><dt>접속 위치</dt><dd>GeoIP 공급자 미연동</dd></div><div><dt>실제 경로</dt><dd>{item.path}</dd></div><div><dt>User-Agent</dt><dd>{item.userAgent || "-"}</dd></div><div><dt>메타데이터</dt><dd>{JSON.stringify(item.metadata || {})}</dd></div></dl></td></tr>}
  </>;
}

function describeUserAgent(value) {
  const userAgent = value || "";
  const browser = userAgent.includes("Edg/") ? "Edge" : userAgent.includes("Chrome/") ? "Chrome" : userAgent.includes("Firefox/") ? "Firefox" : userAgent.includes("Safari/") ? "Safari" : "기타 브라우저";
  const os = userAgent.includes("Windows") ? "Windows" : userAgent.includes("Android") ? "Android" : userAgent.includes("iPhone") || userAgent.includes("iPad") ? "iOS/iPadOS" : userAgent.includes("Mac OS") ? "macOS" : userAgent.includes("Linux") ? "Linux" : "기타 OS";
  return userAgent ? `${browser} · ${os}` : "-";
}

function MonitoringSections({ activeTab, data, onSettingsSaved }) {
  const [settings, setSettings] = useState(data.settings);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const systemMetrics = [
    ["CPU", data.system.cpuPercent, settings.cpuThreshold], ["RAM", data.system.memoryPercent, settings.memoryThreshold], ["Disk", data.system.diskPercent, settings.diskThreshold],
  ];
  const save = async (event) => {
    event.preventDefault(); setSaving(true); setNotice("");
    try { const result = await adminService.updateMonitoringSettings(settings); setSettings(result); onSettingsSaved(result); setNotice("모니터링 정책을 저장했습니다."); }
    catch (error) { setNotice(getApiErrorMessage(error, "설정을 저장하지 못했습니다.")); }
    finally { setSaving(false); }
  };
  return <>
    {activeTab === "system" && <section className="monitor-health-grid" id="monitor-system">
      <article className="admin-panel monitor-system-card"><div className="admin-toolbar"><div><h2>시스템 상태</h2><p>CPU, 메모리, 디스크와 네트워크 상태입니다.</p></div><StatusDot status={data.dashboard.serverStatus} /></div><div className="monitor-metrics">{systemMetrics.map(([label, value, threshold]) => <div key={label}><span>{label}<small>임계값 {threshold}%</small></span><strong>{value == null ? "N/A" : `${value}%`}</strong><i><b style={{ width: `${Math.min(100, value || 0)}%` }} /></i></div>)}</div></article>
      <article className="admin-panel monitor-service-card"><div className="admin-toolbar"><div><h2>서비스 상태</h2><p>API, DB, AI 서버, 객체 스토리지 연결입니다.</p></div></div><div className="monitor-service-list">{data.services.map((service) => <div key={service.name}><StatusDot status={service.status} /><span><strong>{service.name}</strong><small>{service.message || "정상 응답"}</small></span><b>{service.responseTimeMs}ms</b></div>)}</div></article>
    </section>}
    {activeTab === "security" && <section className="monitor-health-grid" id="monitor-alerts">
      <article className="admin-panel"><div className="admin-toolbar"><div><h2>알림 및 최근 장애</h2><p>임계값 초과와 서비스 장애를 자동 판정합니다.</p></div><span className="monitor-count">{data.alerts.length}</span></div><div className="monitor-alert-list">{data.alerts.map((alert, index) => <div className={`alert-${alert.severity.toLowerCase()}`} key={`${alert.title}-${index}`}><strong>{alert.title}</strong><span>{alert.message}</span><small>{alert.source}</small></div>)}{!data.alerts.length && <div className="activity-empty">현재 활성 알림이 없습니다.</div>}{data.recentIncidents.slice(0, 4).map((incident) => <div className="alert-incident" key={incident.id}><strong>{incident.action}</strong><span>{incident.path}</span><small>{incident.statusCode}</small></div>)}</div></article>
      <article className="admin-panel"><div className="admin-toolbar"><div><h2>보안 모니터링</h2><p>로그인 실패와 반복적인 비정상 접근입니다.</p></div><span className="monitor-count">{formatNumber(data.security.failedLogins24h)}</span></div><div className="monitor-security-list">{data.security.suspiciousSources.map((source) => <div key={source.ipAddress}><span><strong>{source.ipAddress}</strong><small>영향 사용자 {source.affectedUsers}명</small></span><b>{source.eventCount}건</b></div>)}{!data.security.suspiciousSources.length && <div className="activity-empty">감지된 비정상 접근이 없습니다.</div>}</div></article>
    </section>}
    {activeTab === "reports" && <section className="admin-panel monitor-report-panel" id="monitor-reports"><div className="admin-toolbar"><div><h2>통계 및 리포트</h2><p>DAU/MAU, 기능 사용량과 장애 건수를 분석합니다.</p></div><div className="monitor-report-head"><span>DAU <b>{formatNumber(data.dashboard.dau)}</b></span><span>MAU <b>{formatNumber(data.dashboard.mau)}</b></span></div></div><div className="monitor-report-grid"><div><h3>기능 사용량 (30일)</h3>{data.reports.featureUsage.slice(0, 8).map((item) => <p key={`${item.category}-${item.action}`}><span>{item.action}<small>{item.category} · 사용자 {item.uniqueUsers}명</small></span><b>{formatNumber(item.count)}</b></p>)}</div><div><h3>일별 운영 리포트</h3>{data.reports.daily.slice(-7).map((item) => <p key={item.reportDate}><span>{item.reportDate}</span><b>{item.events}건 · 오류 {item.failures}</b></p>)}</div></div></section>}
    {activeTab === "settings" && <section className="admin-panel monitor-settings-panel" id="monitor-settings"><div className="admin-toolbar"><div><h2>모니터링 설정</h2><p>알림 임계값과 감사 로그 보관 기간을 관리합니다.</p></div></div><form onSubmit={save}><div className="monitor-setting-grid">{[["cpuThreshold","CPU 임계값","%"],["memoryThreshold","RAM 임계값","%"],["diskThreshold","Disk 임계값","%"],["errorRateThreshold","API 실패율","%"],["failedLoginThreshold","로그인 실패","회"],["logRetentionDays","로그 보관","일"]].map(([key,label,unit]) => <label key={key}><span>{label}</span><div><input type="number" min="1" max={key === "logRetentionDays" ? 2555 : 100} value={settings[key]} onChange={(event) => setSettings((current) => ({ ...current, [key]: Number(event.target.value) }))} /><small>{unit}</small></div></label>)}</div><div className="monitor-settings-actions"><span>{notice}</span><button type="submit" disabled={saving}>{saving ? "저장 중..." : "정책 저장"}</button></div></form></section>}
  </>;
}

function StatusDot({ status }) { const healthy = status === "UP" || status === "HEALTHY"; return <span className={`monitor-status ${healthy ? "healthy" : "degraded"}`}><i />{healthy ? "정상" : "주의"}</span>; }
