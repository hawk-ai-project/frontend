"use client";

import { useEffect, useState } from "react";
import { adminService } from "@/services/adminService";
import { getApiErrorMessage } from "@/services/apiClient";
import ErrorMessage from "@/components/common/ErrorMessage";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;
    adminService.getSettings()
      .then((data) => { if (!cancelled) setSettings(data); })
      .catch((requestError) => { if (!cancelled) setError(getApiErrorMessage(requestError, "설정을 불러오지 못했습니다.")); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const toggle = (key) => setSettings((value) => ({ ...value, [key]: !value[key] }));
  const save = async () => {
    setSaving(true); setError(""); setSuccess("");
    try { setSettings(await adminService.updateSettings(settings)); setSuccess("시스템 설정이 저장되었습니다."); }
    catch (requestError) { setError(getApiErrorMessage(requestError, "설정을 저장하지 못했습니다.")); }
    finally { setSaving(false); }
  };

  return (
    <div className="admin-page">
      <header className="admin-page-head"><div><span className="admin-kicker">SYSTEM</span><h1>시스템 설정</h1><p>서비스 운영에 필요한 기본 정책을 관리합니다.</p></div></header>
      <ErrorMessage message={error} />
      {success && <p className="admin-success-message" role="status">{success}</p>}
      {loading && <div className="admin-data-loading"><span className="admin-spinner" />설정을 불러오고 있습니다.</div>}
      {settings && <>
        <section className="admin-panel admin-settings-panel">
          <div className="admin-section-title"><h2>서비스 설정</h2><p>사용자에게 적용되는 공통 기능을 설정합니다.</p></div>
          <label className="admin-setting-row"><span><strong>신규 회원가입 허용</strong><small>끄면 새로운 사용자의 회원가입 요청이 서버에서 차단됩니다.</small></span><input type="checkbox" checked={settings.signupEnabled} onChange={() => toggle("signupEnabled")} /></label>
          <label className="admin-setting-row"><span><strong>게시판 쓰기 허용</strong><small>일반 회원의 게시글 작성 허용 정책을 저장합니다.</small></span><input type="checkbox" checked={settings.boardWriteEnabled} onChange={() => toggle("boardWriteEnabled")} /></label>
          <label className="admin-setting-row"><span><strong>점검 완료 알림</strong><small>AI 점검 완료 알림 사용 여부를 저장합니다.</small></span><input type="checkbox" checked={settings.inspectionNotificationEnabled} onChange={() => toggle("inspectionNotificationEnabled")} /></label>
        </section>
        <section className="admin-panel admin-settings-panel">
          <div className="admin-section-title"><h2>세션 및 보안</h2><p>새로 로그인하는 사용자의 세션 유지 시간을 설정합니다.</p></div>
          <label className="admin-field"><span>세션 유지 시간</span><select value={settings.sessionExpireMinutes} onChange={(event) => setSettings((value) => ({ ...value, sessionExpireMinutes: Number(event.target.value) }))}><option value="30">30분</option><option value="60">1시간</option><option value="480">8시간</option></select></label>
          <div className="admin-settings-actions"><button type="button" className="admin-primary-btn" disabled={saving} onClick={save}>{saving ? "저장 중..." : "변경사항 저장"}</button></div>
        </section>
      </>}
    </div>
  );
}
