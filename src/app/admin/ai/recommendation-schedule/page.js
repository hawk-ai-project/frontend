"use client";

import { useEffect, useMemo, useState } from "react";
import ErrorMessage from "@/components/common/ErrorMessage";
import { getApiErrorMessage } from "@/services/apiClient";
import { adminService } from "@/services/adminService";

const PRESETS = [
  { value: 15, label: "15분" }, { value: 30, label: "30분" },
  { value: 60, label: "1시간" }, { value: 180, label: "3시간" },
  { value: 360, label: "6시간" }, { value: 720, label: "12시간" },
  { value: 1440, label: "24시간" },
];

const formatDateTime = (value) => value
  ? new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Seoul" }).format(new Date(value))
  : "아직 실행되지 않음";

export default function RecommendationSchedulePage() {
  const [schedule, setSchedule] = useState(null);
  const [intervalChoice, setIntervalChoice] = useState("1440");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;
    adminService.getAiRecommendationSchedule()
      .then((data) => {
        if (cancelled) return;
        setSchedule(data);
        setIntervalChoice(PRESETS.some((item) => item.value === data.intervalMinutes) ? String(data.intervalMinutes) : "custom");
      })
      .catch((requestError) => !cancelled && setError(getApiErrorMessage(requestError, "스케줄 설정을 불러오지 못했습니다.")))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  const intervalLabel = useMemo(() => {
    if (!schedule) return "";
    return PRESETS.find((item) => item.value === schedule.intervalMinutes)?.label || `${schedule.intervalMinutes}분`;
  }, [schedule]);

  const save = async () => {
    setError(""); setSuccess("");
    if (schedule.mode === "INTERVAL" && (!Number.isInteger(Number(schedule.intervalMinutes)) || schedule.intervalMinutes < 1 || schedule.intervalMinutes > 10080)) {
      setError("사용자 지정 간격은 1분 이상 10,080분 이하로 입력해 주세요.");
      return;
    }
    setSaving(true);
    try {
      const saved = await adminService.updateAiRecommendationSchedule({
        mode: schedule.mode,
        dailyTime: schedule.dailyTime,
        intervalMinutes: Number(schedule.intervalMinutes),
      });
      setSchedule(saved);
      setIntervalChoice(PRESETS.some((item) => item.value === saved.intervalMinutes) ? String(saved.intervalMinutes) : "custom");
      setSuccess("AI 추천 스케줄을 저장했습니다. 실행 중인 서버에 자동 반영됩니다.");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "스케줄을 저장하지 못했습니다."));
    } finally { setSaving(false); }
  };

  return (
    <div className="admin-page recommendation-schedule-page">
      <header className="admin-page-head"><div><span className="admin-kicker">AI AUTOMATION</span><h1>AI 추천 스케줄러</h1><p>후보 모델 비교와 AI 추천 결과 갱신 시점을 설정합니다.</p></div></header>
      <ErrorMessage message={error} />
      {success && <p className="admin-success-message" role="status">{success}</p>}
      {loading && <div className="admin-data-loading"><span className="admin-spinner" />스케줄을 불러오고 있습니다.</div>}
      {schedule && <>
        <section className="admin-panel recommendation-status-grid">
          <article><span>현재 실행 방식</span><strong>{schedule.mode === "DAILY" ? `매일 ${schedule.dailyTime}` : `${intervalLabel}마다`}</strong><small>Asia/Seoul 기준</small></article>
          <article><span>다음 실행 예정</span><strong>{formatDateTime(schedule.nextRunAt)}</strong><small>설정 변경 시 다시 계산됩니다.</small></article>
          <article><span>마지막 실행</span><strong>{formatDateTime(schedule.lastRunAt)}</strong><small>추천 캐시 갱신 완료 시각</small></article>
        </section>
        <section className="admin-panel admin-settings-panel recommendation-config-panel">
          <div className="admin-section-title"><h2>실행 주기 설정</h2><p>기본값은 매일 오전 9시입니다. 지정 시각 또는 반복 간격 중 하나를 선택하세요.</p></div>
          <div className="recommendation-mode-grid">
            <label className={schedule.mode === "DAILY" ? "active" : ""}><input type="radio" name="mode" checked={schedule.mode === "DAILY"} onChange={() => setSchedule((value) => ({ ...value, mode: "DAILY" }))} /><span><strong>매일 지정 시각</strong><small>하루 한 번 원하는 시각에 실행합니다.</small></span></label>
            <label className={schedule.mode === "INTERVAL" ? "active" : ""}><input type="radio" name="mode" checked={schedule.mode === "INTERVAL"} onChange={() => setSchedule((value) => ({ ...value, mode: "INTERVAL" }))} /><span><strong>반복 간격</strong><small>선택한 분 또는 시간 간격으로 반복합니다.</small></span></label>
          </div>
          {schedule.mode === "DAILY" ? <label className="recommendation-form-field"><span>매일 실행 시각</span><input type="time" value={schedule.dailyTime} onChange={(event) => setSchedule((value) => ({ ...value, dailyTime: event.target.value }))} /><small>한국 표준시(KST)를 기준으로 실행됩니다.</small></label> : <div className="recommendation-interval-fields"><label className="recommendation-form-field"><span>반복 간격</span><select value={intervalChoice} onChange={(event) => { const choice = event.target.value; setIntervalChoice(choice); if (choice !== "custom") setSchedule((value) => ({ ...value, intervalMinutes: Number(choice) })); }}><option value="15">15분</option><option value="30">30분</option><option value="60">1시간</option><option value="180">3시간</option><option value="360">6시간</option><option value="720">12시간</option><option value="1440">24시간</option><option value="custom">사용자 지정(분)</option></select></label>{intervalChoice === "custom" && <label className="recommendation-form-field"><span>사용자 지정 분</span><input type="number" min="1" max="10080" step="1" value={schedule.intervalMinutes} onChange={(event) => setSchedule((value) => ({ ...value, intervalMinutes: Number(event.target.value) }))} /><small>1분~10,080분(7일) 사이로 입력하세요.</small></label>}</div>}
          <div className="admin-settings-actions"><button type="button" className="admin-primary-btn" disabled={saving} onClick={save}>{saving ? "저장 중..." : "스케줄 저장"}</button></div>
        </section>
      </>}
    </div>
  );
}
