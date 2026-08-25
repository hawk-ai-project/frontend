"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ErrorMessage from "@/components/common/ErrorMessage";
import { getApiErrorMessage } from "@/services/apiClient";
import { historyService } from "@/services/historyService";
import "../../reinspections.css";

const percent = (value) =>
  value == null ? "-" : `${(Number(value) * 100).toFixed(1)}%`;
const number = (value) =>
  value == null ? "-" : Number(value).toLocaleString("ko-KR");
const bytes = (value) => {
  if (!value) return "-";
  let amount = Number(value),
    unit = 0;
  const units = ["B", "KB", "MB", "GB"];
  while (amount >= 1024 && unit < units.length - 1) {
    amount /= 1024;
    unit += 1;
  }
  return `${amount.toFixed(unit ? 1 : 0)} ${units[unit]}`;
};

export default function ReinspectionModelDetailPage() {
  const { id } = useParams();
  const inspectionId = Number(id);
  const [detail, setDetail] = useState(null);
  const [artifactUrls, setArtifactUrls] = useState({});
  const [selectedArtifact, setSelectedArtifact] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const urls = [];

    historyService
      .getReinspectionModelDetail(inspectionId)
      .then(async (model) => {
        const artifacts = Array.isArray(model?.artifacts)
          ? model.artifacts
          : [];
        const pairs = await Promise.all(
          artifacts.map(async (artifact) => {
            try {
              const path = artifact.path || artifact.filePath || artifact.name;
              const blob = await historyService.getReinspectionModelArtifact(
                inspectionId,
                path,
              );
              const url = URL.createObjectURL(blob);
              urls.push(url);
              return [path, url];
            } catch {
              return [artifact.path || artifact.name, null];
            }
          }),
        );

        if (active) {
          setDetail(model);
          setArtifactUrls(Object.fromEntries(pairs.filter(([_, url]) => url)));
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(
            getApiErrorMessage(
              requestError,
              "모델 상세 정보를 불러오지 못했습니다.",
            ),
          );
        }
      });

    return () => {
      active = false;
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [inspectionId]);

  useEffect(() => {
    if (!selectedArtifact) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setSelectedArtifact(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedArtifact]);

  const config = detail?.config || detail?.hyperparameters || {};
  const classMetrics = detail?.classMetrics || detail?.class_metrics || [];
  const artifacts = detail?.artifacts || [];

  return (
    <main className="page-shell reinspection-model-page">
      <header className="reinspection-head">
        <div>
          <span>MODEL DETAIL</span>
          <h1>{detail?.name || detail?.modelName || "사용 모델 상세"}</h1>
          <p>
            재점검 #{inspectionId}에 실제 사용된 모델의 설정과 성능을
            확인합니다.
          </p>
        </div>
        <Link href={`/reinspections/${inspectionId}`}>재점검으로 돌아가기</Link>
      </header>
      <ErrorMessage message={error} />
      {!detail && !error && (
        <div className="reinspection-empty">
          모델 상세 정보를 불러오는 중입니다.
        </div>
      )}
      {detail && (
        <>
          <section className="reinspection-model-detail-summary">
            <div>
              <span>실행 모델</span>
              <strong>{detail.modelName || detail.name || "-"}</strong>
              <small>{detail.modelVersion || detail.id || "-"}</small>
            </div>
            {[
              ["기반 모델", config.model || config.base_model],
              ["Optimizer", config.optimizer],
              ["Epoch", config.epochs || config.epoch],
              ["이미지 크기", config.imgsz || config.image_size],
              ["Batch", config.batch || config.batch_size],
              ["Device", config.device],
            ].map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{value ?? "-"}</strong>
              </div>
            ))}
          </section>
          <section className="reinspection-model-metrics">
            <h2>종합 성능</h2>
            <div>
              {Object.entries(detail.metrics || {})
                .filter(([key]) => key !== "epoch")
                .map(([key, value]) => (
                  <article key={key}>
                    <span>{key.replaceAll("_", " ")}</span>
                    <strong>
                      {typeof value === "number" ? percent(value) : value}
                    </strong>
                  </article>
                ))}
            </div>
          </section>
          <section className="reinspection-model-class-table">
            <h2>탐지 클래스별 성능</h2>
            <div>
              <table>
                <thead>
                  <tr>
                    <th>클래스</th>
                    <th>Accuracy</th>
                    <th>Precision</th>
                    <th>Recall</th>
                    <th>mAP50</th>
                    <th>mAP50-95</th>
                    <th>표본</th>
                  </tr>
                </thead>
                <tbody>
                  {classMetrics.map((metric, idx) => (
                    <tr
                      key={`${metric.classIndex ?? idx}-${
                        metric.className || metric.name
                      }`}
                    >
                      <td>{metric.className || metric.name}</td>
                      <td>{percent(metric.accuracy)}</td>
                      <td>{percent(metric.precision)}</td>
                      <td>{percent(metric.recall)}</td>
                      <td>{percent(metric.map50 || metric.mAP50)}</td>
                      <td>{percent(metric.map50_95 || metric.mAP50_95)}</td>
                      <td>{number(metric.support || metric.count)}</td>
                    </tr>
                  ))}
                  {!classMetrics.length && (
                    <tr>
                      <td colSpan="7">저장된 클래스별 평가 지표가 없습니다.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
          <section className="reinspection-model-artifacts">
            <h2>
              실험 산출물 <span>{artifacts.length}개</span>
            </h2>
            <div>
              {artifacts.map((artifact) => {
                const path =
                  artifact.path || artifact.filePath || artifact.name;
                const url = artifactUrls[path];
                return (
                  <button
                    type="button"
                    key={path}
                    onClick={() =>
                      setSelectedArtifact({ ...artifact, url, path })
                    }
                    disabled={!url}
                    aria-label={`${artifact.name || path} 이미지 확대`}
                  >
                    <img
                      src={url}
                      alt={`${detail.name || "모델"} ${artifact.name || path}`}
                    />
                    <span>
                      {artifact.name || path}
                      <small>
                        {bytes(artifact.sizeBytes || artifact.size)}
                      </small>
                    </span>
                  </button>
                );
              })}
              {!artifacts.length && <p>표시할 실험 산출물이 없습니다.</p>}
            </div>
          </section>
        </>
      )}
      {selectedArtifact && (
        <div
          className="reinspection-artifact-modal"
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedArtifact.name || selectedArtifact.path} 확대 이미지`}
          onClick={() => setSelectedArtifact(null)}
        >
          <div onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              onClick={() => setSelectedArtifact(null)}
              aria-label="확대 이미지 닫기"
            >
              ×
            </button>
            <img
              src={selectedArtifact.url}
              alt={`${detail?.name || "모델"} ${
                selectedArtifact.name || selectedArtifact.path
              }`}
            />
            <p>
              {selectedArtifact.name || selectedArtifact.path}
              <small>
                {bytes(selectedArtifact.sizeBytes || selectedArtifact.size)}
              </small>
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
