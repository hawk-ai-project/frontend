"use client";

import { useCallback, useEffect, useState } from "react";
import ErrorMessage from "@/components/common/ErrorMessage";
import { adminService } from "@/services/adminService";
import { getApiErrorMessage } from "@/services/apiClient";

const number = (value) => value == null ? "-" : Number(value).toLocaleString("ko-KR");
const percent = (value) => value == null ? "-" : `${(Number(value) * 100).toFixed(1)}%`;
const date = (value) => value ? new Intl.DateTimeFormat("ko-KR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value)) : "-";
const bytes = (value) => {
  if (!value) return "-";
  const units = ["B", "GB", "TB"];
  let amount = Number(value);
  let unit = 0;
  while (amount >= 1024 && unit < units.length - 1) { amount /= 1024; unit += 1; }
  return `${amount.toFixed(unit ? 1 : 0)} ${units[unit]}`;
};

export default function AiModelsPage() {
  const [models, setModels] = useState(null);
  const [system, setSystem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async (initial = false) => {
    if (initial) setLoading(true);
    try {
      const [modelData, systemData] = await Promise.all([adminService.getAiModels(), adminService.getAiSystem()]);
      setModels(modelData);
      setSystem(systemData);
      setError("");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "AI 서버 정보를 불러오지 못했습니다."));
    } finally { if (initial) setLoading(false); }
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([adminService.getAiModels(), adminService.getAiSystem()])
      .then(([modelData, systemData]) => { if (!cancelled) { setModels(modelData); setSystem(systemData); } })
      .catch((requestError) => { if (!cancelled) setError(getApiErrorMessage(requestError, "AI 서버 정보를 불러오지 못했습니다.")); })
      .finally(() => { if (!cancelled) setLoading(false); });
    const timer = setInterval(() => { if (!cancelled) void load(); }, 5000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [load]);

  const select = async (model) => {
    setSelecting(model.id); setError("");
    try { setModels(await adminService.selectAiModel(model.id)); }
    catch (requestError) { setError(getApiErrorMessage(requestError, "AI 모델을 선택하지 못했습니다.")); }
    finally { setSelecting(""); }
  };

  const gpu = system?.gpus?.[0];
  return <div className="admin-page ai-models-page">
    <header className="admin-page-head"><div><span className="admin-kicker">AI MANAGEMENT</span><h1>모델 실험·GPU</h1><p>AI/runs 실험 결과와 현재 추론 서버의 리소스 상태를 확인합니다.</p></div><button type="button" className="admin-primary-btn" onClick={() => load()} disabled={loading}>새로고침</button></header>
    <ErrorMessage message={error} />
    <div className="admin-stat-grid ai-system-stats">
      <article><span>GPU 상태</span><strong className={system?.torchCuda?.available ? "ai-online" : "ai-offline"}>{system ? (system.torchCuda?.available ? "ONLINE" : "OFFLINE") : "-"}</strong><small>{gpu?.name || system?.torchCuda?.devices?.[0] || "AI 서버 응답 대기"}</small></article>
      <article><span>GPU 메모리</span><strong>{gpu ? `${number(gpu.memoryUsedMiB)} / ${number(gpu.memoryTotalMiB)} MiB` : "-"}</strong><small>{gpu ? `사용률 ${number(gpu.utilizationPercent)}% · 온도 ${number(gpu.temperatureC)}°C` : "nvidia-smi 정보 없음"}</small></article>
      <article><span>호스트 메모리</span><strong>{system ? `${system.memory.usedPercent}%` : "-"}</strong><small>{system ? `${bytes(system.memory.totalBytes - system.memory.availableBytes)} 사용 / ${bytes(system.memory.totalBytes)}` : "실시간 조회 중"}</small></article>
    </div>
    <div className="ai-system-grid">
      <section className="admin-panel"><div className="admin-toolbar"><div><h2>실시간 시스템 현황</h2><p>5초 간격으로 AI 서버에서 갱신됩니다. 마지막 갱신 {date(system?.timestamp)}</p></div><span className="ai-live-dot">LIVE</span></div><div className="ai-system-details"><div><span>CPU 코어</span><strong>{number(system?.cpu?.cores)}</strong></div><div><span>1분 부하</span><strong>{system?.cpu?.load1m ?? "-"}</strong></div><div><span>디스크 사용률</span><strong>{system ? `${system.disk.usedPercent}%` : "-"}</strong></div><div><span>GPU 전력</span><strong>{gpu ? `${number(gpu.powerDrawW)} / ${number(gpu.powerLimitW)} W` : "-"}</strong></div></div></section>
      <section className="admin-panel"><div className="admin-toolbar"><div><h2>현재 선택 모델</h2><p>새 모델 선택은 다음 탐지 요청부터 적용됩니다.</p></div></div><div className="ai-selected-model"><strong>{models?.selectedModelId || "기본 모델"}</strong><small>{models?.selectedModelPath || "-"}</small></div></section>
    </div>
    <section className="admin-panel ai-experiment-panel"><div className="admin-toolbar"><div><h2>실험 추적</h2><p>{models ? `${models.models.length}개 실험 · ${models.runsDirectory}` : "AI/runs에서 학습 실험을 읽고 있습니다."}</p></div></div>{loading && !models ? <div className="admin-data-loading"><span className="admin-spinner" />실험 정보를 불러오고 있습니다.</div> : <div className="admin-table-wrap"><table className="admin-table ai-experiment-table"><thead><tr><th>실험</th><th>기반 모델</th><th>학습 설정</th><th>최종 지표</th><th>산출물</th><th>갱신</th><th>선택</th></tr></thead><tbody>{(models?.models || []).map((model) => <tr key={model.id} className={models.selectedModelId === model.id ? "ai-selected-row" : ""}><td><strong>{model.name}</strong><small>{model.path}</small></td><td>{model.model || "-"}</td><td>{model.optimizer || "-"}<small>{model.epochs ? `${model.epochs} epochs · ${model.imageSize || "-"}px · batch ${model.batch || "-"}` : "-"}</small></td><td><div className="ai-metrics"><span>mAP50 <b>{percent(model.metrics?.map50)}</b></span><span>mAP50-95 <b>{percent(model.metrics?.map50_95)}</b></span><span>Precision <b>{percent(model.metrics?.precision)}</b></span></div></td><td>{number(model.artifactCount)}개<small className={model.hasWeights ? "ai-weight-ready" : ""}>{model.hasWeights ? "best.pt 준비됨" : "가중치 없음"}</small></td><td>{date(model.updatedAt)}</td><td><button type="button" className="ai-select-btn" disabled={!model.hasWeights || selecting === model.id || models.selectedModelId === model.id} onClick={() => select(model)}>{selecting === model.id ? "적용 중" : models.selectedModelId === model.id ? "사용 중" : model.hasWeights ? "이 모델 사용" : "선택 불가"}</button></td></tr>)}{models && !models.models.length && <tr><td colSpan="7" className="admin-empty-cell">AI/runs에 실험 결과가 없습니다.</td></tr>}</tbody></table></div>}</section>
  </div>;
}
