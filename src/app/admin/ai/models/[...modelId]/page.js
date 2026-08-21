"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ErrorMessage from "@/components/common/ErrorMessage";
import { adminService } from "@/services/adminService";
import { getApiErrorMessage } from "@/services/apiClient";

const number = (value) => value == null ? "-" : Number(value).toLocaleString("ko-KR");
const bytes = (value) => {
  if (!value) return "-";
  let amount = Number(value);
  const units = ["B", "KB", "MB", "GB"];
  let unit = 0;
  while (amount >= 1024 && unit < units.length - 1) { amount /= 1024; unit += 1; }
  return `${amount.toFixed(unit ? 1 : 0)} ${units[unit]}`;
};

export default function AiModelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const modelId = Array.isArray(params.modelId) ? params.modelId.join("/") : params.modelId;
  const [detail, setDetail] = useState(null);
  const [artifactUrls, setArtifactUrls] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await adminService.getAiModelDetail(modelId);
        const pairs = await Promise.all(data.artifacts.map(async (artifact) => [artifact.path, URL.createObjectURL(await adminService.getAiArtifact(artifact.path))]));
        if (!cancelled) { setDetail(data); setArtifactUrls(Object.fromEntries(pairs)); }
        else pairs.forEach(([, url]) => URL.revokeObjectURL(url));
      } catch (requestError) {
        if (!cancelled) setError(getApiErrorMessage(requestError, "실험 상세 정보를 불러오지 못했습니다."));
      }
    };
    if (modelId) void load();
    return () => { cancelled = true; };
  }, [modelId]);

  useEffect(() => {
    const close = (event) => { if (event.key === "Escape") setSelectedImage(null); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  if (!detail) return <div className="admin-page ai-model-detail-page"><button type="button" className="ai-back-btn" onClick={() => router.back()}>← 실험 목록으로</button><ErrorMessage message={error} />{!error && <div className="admin-data-loading"><span className="admin-spinner" />실험 상세 정보를 불러오고 있습니다.</div>}</div>;
  const groups = ["metrics", "training", "validation"];
  return <div className="admin-page ai-model-detail-page">
    <header className="admin-page-head"><div><button type="button" className="ai-back-btn" onClick={() => router.back()}>← 실험 목록으로</button><span className="admin-kicker">RUN DETAIL</span><h1>{detail.name}</h1><p>{detail.id} · 산출물 {detail.artifacts.length}개</p></div></header>
    <ErrorMessage message={error} />
    <section className="admin-panel ai-detail-summary"><div className="ai-detail-config">{["task", "model", "optimizer", "epochs", "imgsz", "batch", "device", "seed"].map((key) => detail.config[key] != null && <span key={key}><b>{key}</b>{String(detail.config[key])}</span>)}</div><div className="ai-detail-metrics">{Object.entries(detail.metrics).filter(([key]) => key !== "epoch").map(([key, value]) => <span key={key}><small>{key.replaceAll("_", " ")}</small><strong>{typeof value === "number" ? value.toFixed(4) : value}</strong></span>)}</div></section>
    <div className="ai-artifact-groups">{groups.map((group) => { const items = detail.artifacts.filter((item) => item.category === group); return items.length ? <section className="admin-panel ai-artifact-section" key={group}><div className="admin-toolbar"><div><h2>{group === "metrics" ? "학습 지표·분석" : group === "training" ? "학습 이미지" : "검증 이미지"}</h2><p>이미지를 클릭하면 원본 크기로 자세히 볼 수 있습니다.</p></div><span>{items.length}개</span></div><div className="ai-artifact-grid">{items.map((item) => <button type="button" className="ai-artifact-card" key={item.path} onClick={() => setSelectedImage({ ...item, url: artifactUrls[item.path] })}><img src={artifactUrls[item.path]} alt={`${detail.name} ${item.name}`} /><span>{item.name}<small>{bytes(item.sizeBytes)}</small></span></button>)}</div></section> : null; })}</div>
    {selectedImage && <div className="ai-image-modal" role="dialog" aria-modal="true" aria-label={`${selectedImage.name} 크게 보기`} onClick={() => setSelectedImage(null)}><div className="ai-image-modal-content" onClick={(event) => event.stopPropagation()}><button type="button" className="ai-modal-close" onClick={() => setSelectedImage(null)} aria-label="이미지 닫기">×</button><img src={selectedImage.url} alt={selectedImage.name} /><p>{selectedImage.name} · {bytes(selectedImage.sizeBytes)}</p></div></div>}
  </div>;
}
