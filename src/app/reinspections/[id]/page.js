"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import ErrorMessage from "@/components/common/ErrorMessage";
import ModelRecommendationCard from "@/components/ai/ModelRecommendationCard";
import { historyService } from "@/services/historyService";
import { modelRecommendationService } from "@/services/modelRecommendationService";
import { getApiErrorMessage } from "@/services/apiClient";
import "../reinspections.css";

const COLORS = [
  "#36a2eb",
  "#ff6384",
  "#4bc0c0",
  "#ff9f40",
  "#9966ff",
  "#57a773",
];
const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const percent = (value) =>
  value == null ? "-" : `${(Number(value) * 100).toFixed(1)}%`;

const parseDetectionsToBoxes = (rawDetections) => {
  if (!rawDetections) return [];
  let list = rawDetections;
  if (typeof rawDetections === "string") {
    try {
      list = JSON.parse(rawDetections);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(list)) return [];

  return list.map((d, i) => {
    const bboxArr = Array.isArray(d.bbox) ? d.bbox : [];
    const bx = d.bboxX ?? bboxArr[0] ?? 0;
    const by = d.bboxY ?? bboxArr[1] ?? 0;
    const bw = d.bboxWidth ?? bboxArr[2] ?? 0.001;
    const bh = d.bboxHeight ?? bboxArr[3] ?? 0.001;

    return {
      id: d.id ?? d.detectionId ?? i + 1,
      className: d.className || d.name_ko || d.label || "Unknown",
      originalClassName: d.originalClassName || null,
      confidence: d.confidence ?? d.score ?? null,
      modified: Boolean(d.modified),
      manuallyAdded: Boolean(d.manuallyAdded),
      bbox: [bx, by, bw, bh].map(Number),
      color: COLORS[i % COLORS.length],
    };
  });
};

export default function ReinspectionLabelEditor() {
  const { id } = useParams();
  const router = useRouter();
  const inspectionId = Number(id);
  const canvasRef = useRef(null);
  const gestureRef = useRef(null);
  const nextId = useRef(-1);

  const [detail, setDetail] = useState(null);
  const [classes, setClasses] = useState([]);
  const [imageUrl, setImageUrl] = useState("");
  const [boxes, setBoxes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState("select");
  const [deletedIds, setDeletedIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [recommendation, setRecommendation] = useState(null);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [recommendationError, setRecommendationError] = useState("");
  const [models, setModels] = useState([]);
  const [selectedModelId, setSelectedModelId] = useState("");
  const [selectingModelId, setSelectingModelId] = useState("");
  const [detecting, setDetecting] = useState(false);

  const loadRecommendation = useCallback(async () => {
    if (!inspectionId) return;
    setRecommendationLoading(true);
    setRecommendationError("");
    try {
      setRecommendation(
        await modelRecommendationService.recommendReinspection(inspectionId),
      );
    } catch (requestError) {
      setRecommendationError(
        requestError.response?.status === 400
          ? "선정 후보 모델이 없습니다. 관리자 AI 관리에서 비교할 모델을 후보로 등록해 주세요."
          : getApiErrorMessage(requestError, "AI 모델 추천을 불러오지 못했습니다."),
      );
    } finally {
      setRecommendationLoading(false);
    }
  }, [inspectionId]);

  const load = useCallback(async () => {
    try {
      const [item, types, blob, catalog] = await Promise.all([
        historyService.getReinspectionDetail(inspectionId),
        historyService.getReinspectionClasses(),
        historyService.getHistoryImage(inspectionId, "ORIGINAL"),
        historyService.getReinspectionModels(),
      ]);

      setDetail(item);

      // 클래스 목록 하위 호환
      const classList = Array.isArray(types)
        ? types.map((t) => (typeof t === "string" ? { id: t, name: t } : t))
        : [];
      setClasses(classList);
      setModels(catalog.models || []);
      setSelectedModelId((current) => current || catalog.selectedModelId || item.modelExternalId || "");

      setBoxes(parseDetectionsToBoxes(item.detections));
      setImageUrl(URL.createObjectURL(blob));
    } catch (e) {
      setError(getApiErrorMessage(e, "라벨링 데이터를 불러오지 못했습니다."));
    }
  }, [inspectionId]);

  useEffect(() => {
    const timer = setTimeout(() => void load(), 0);
    return () => clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    const timer = setTimeout(() => void loadRecommendation(), 0);
    return () => clearTimeout(timer);
  }, [loadRecommendation]);

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  const point = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    return [
      clamp((e.clientX - r.left) / r.width),
      clamp((e.clientY - r.top) / r.height),
    ];
  };

  const patch = (id, p) =>
    setBoxes((v) =>
      v.map((b) => (b.id === id ? { ...b, ...p, modified: true } : b)),
    );

  const down = (e) => {
    if (e.button !== 0 || mode !== "draw") return;
    const [x, y] = point(e);
    const id = nextId.current--;
    gestureRef.current = { kind: "draw", start: [x, y], id };

    const initialClassName =
      classes[0]?.name || classes[0]?.className || "Unknown";

    setBoxes((v) => [
      ...v,
      {
        id,
        className: initialClassName,
        originalClassName: null,
        confidence: null,
        modified: true,
        manuallyAdded: true,
        bbox: [x, y, 0.001, 0.001],
        color: COLORS[v.length % COLORS.length],
      },
    ]);
    setSelected(id);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const start = (e, b, kind) => {
    if (mode !== "select") return;
    e.stopPropagation();
    gestureRef.current = {
      kind,
      id: b.id,
      start: point(e),
      original: [...b.bbox],
    };
    setSelected(b.id);
    canvasRef.current.setPointerCapture(e.pointerId);
  };

  const move = (e) => {
    const g = gestureRef.current;
    if (!g) return;
    const [x, y] = point(e);

    if (g.kind === "draw") {
      patch(g.id, {
        bbox: [
          Math.min(g.start[0], x),
          Math.min(g.start[1], y),
          Math.max(0.001, Math.abs(x - g.start[0])),
          Math.max(0.001, Math.abs(y - g.start[1])),
        ],
      });
      return;
    }

    const dx = x - g.start[0];
    const dy = y - g.start[1];
    const b = g.original;

    if (g.kind === "move") {
      patch(g.id, {
        bbox: [
          clamp(b[0] + dx, 0, 1 - b[2]),
          clamp(b[1] + dy, 0, 1 - b[3]),
          b[2],
          b[3],
        ],
      });
    } else {
      patch(g.id, {
        bbox: [
          b[0],
          b[1],
          clamp(b[2] + dx, 0.005, 1 - b[0]),
          clamp(b[3] + dy, 0.005, 1 - b[1]),
        ],
      });
    }
  };

  const up = () => {
    gestureRef.current = null;
    if (mode === "draw") setMode("select");
  };

  const remove = () => {
    const b = boxes.find((v) => v.id === selected);
    if (!b) return;
    if (b.id > 0) setDeletedIds((v) => [...v, b.id]);
    setBoxes((v) => v.filter((x) => x.id !== selected));
    setSelected(null);
  };

  const save = async () => {
    setSaving(true);
    try {
      await historyService.saveReinspectionAnnotations(inspectionId, {
        boxes: boxes.map((b) => ({
          id: b.id > 0 ? b.id : null,
          className: b.className,
          bbox: b.bbox,
        })),
        deletedIds,
      });
      router.push("/reinspections");
    } catch (e) {
      setError(getApiErrorMessage(e, "라벨 저장에 실패했습니다."));
    } finally {
      setSaving(false);
    }
  };

  const redetect = async () => {
    if (!selectedModelId) return;
    setDetecting(true);
    setError("");
    try {
      await historyService.analyzeImage(inspectionId);
      setDeletedIds([]);
      setSelected(null);
      await load();
      await loadRecommendation();
    } catch (e) {
      setError(getApiErrorMessage(e, "선택한 모델로 다시 탐지하지 못했습니다."));
    } finally {
      setDetecting(false);
    }
  };

  const selectRecommendedModel = async (modelId) => {
    const recommendedIds = new Set(
      (recommendation?.recommendations || []).map((item) => item.modelId),
    );
    if (recommendation?.recommendedModelId) {
      recommendedIds.add(recommendation.recommendedModelId);
    }
    if (!recommendedIds.has(modelId)) return;

    setSelectingModelId(modelId);
    setError("");
    try {
      await historyService.selectReinspectionModel(inspectionId, modelId);
      setSelectedModelId(modelId);
    } catch (e) {
      setError(getApiErrorMessage(e, "추천 모델을 선택하지 못했습니다."));
    } finally {
      setSelectingModelId("");
    }
  };

  const current = boxes.find((b) => b.id === selected);
  const aiBoxes = boxes.filter((b) => !b.manuallyAdded && b.confidence != null);
  const averageConfidence = aiBoxes.length
    ? aiBoxes.reduce((sum, b) => sum + Number(b.confidence), 0) / aiBoxes.length
    : null;

  return (
    <main className="page-shell reinspection-editor">
      <header className="reinspection-head">
        <div>
          <span>MANUAL LABELING</span>
          <h1>{detail?.title || "수동 라벨링"}</h1>
          <p>Bounding Box를 직접 추가하거나 위치와 클래스를 수정합니다.</p>
        </div>
        <Link href="/reinspections">목록으로 돌아가기</Link>
      </header>
      <ErrorMessage message={error} />
      {detail && (
        <section className="reinspection-model-summary">
          <div>
            <span>사용 모델</span>
            <strong>
              {detail.modelDisplayName || detail.modelName || "모델 정보 없음"}
            </strong>
            <small>{detail.modelVersion || "버전 정보 없음"}</small>
          </div>
          <div>
            <span>이미지 평균 신뢰도</span>
            <strong>{percent(averageConfidence)}</strong>
            <small>AI 최초 탐지 {aiBoxes.length}개 기준</small>
          </div>
          <div>
            <span>모델 성능</span>
            <strong>{percent(detail.modelMap50 || detail.map50)}</strong>
            <small>
              mAP50 · mAP50-95{" "}
              {percent(detail.modelMap50_95 || detail.map50_95)}
            </small>
          </div>
          <div>
            <span>학습 설정</span>
            <strong>{detail.modelBaseName || detail.baseModel || "-"}</strong>
            <small>
              {detail.modelOptimizer || detail.optimizer || "-"} ·{" "}
              {detail.modelEpochs ?? detail.epochs ?? "-"} epochs ·{" "}
              {detail.modelImageSize ?? detail.imgsz ?? "-"}px
            </small>
          </div>
          {(detail.modelExternalId || detail.modelId) && (
            <Link
              className="reinspection-model-link"
              href={`/reinspections/${inspectionId}/model`}
            >
              모델 상세 보기
            </Link>
          )}
        </section>
      )}
      <ModelRecommendationCard
        recommendation={recommendation}
        loading={recommendationLoading}
        error={recommendationError}
        title="재점검 AI 추천"
        description="AI가 이 재점검에 적합하다고 판단한 추천 모델만 선택할 수 있습니다."
        onRefresh={() => void loadRecommendation()}
        onSelectModel={(modelId) => void selectRecommendedModel(modelId)}
        selectedModelId={selectedModelId}
        selectableModels={models}
        selectingModelId={selectingModelId}
      />
      <section className="reinspection-redetect-action">
        <div>
          <strong>선택 모델로 재탐지</strong>
          <span>
            {models.find((model) => model.id === selectedModelId)?.name ||
              "위 추천 카드에서 모델을 선택해 주세요."}
          </span>
        </div>
        <button
          type="button"
          disabled={!selectedModelId || detecting || Boolean(selectingModelId)}
          onClick={redetect}
        >
          {detecting ? "다시 탐지 중..." : "선택 모델로 다시 탐지"}
        </button>
      </section>
      <section className="reinspection-editor-toolbar">
        <div>
          <button
            className={mode === "select" ? "active" : ""}
            onClick={() => setMode("select")}
          >
            선택·이동
          </button>
          <button
            className={mode === "draw" ? "active" : ""}
            onClick={() => setMode("draw")}
          >
            박스 추가
          </button>
          <button disabled={!selected} onClick={remove}>
            선택 삭제
          </button>
        </div>
        <span>객체 {boxes.length}개</span>
        <button
          className="btn btn-primary"
          disabled={saving || !detail}
          onClick={save}
        >
          {saving ? "저장 중..." : "라벨 저장"}
        </button>
      </section>
      <div className="reinspection-editor-grid">
        <section className="reinspection-canvas-wrap">
          <div
            ref={canvasRef}
            className={`reinspection-canvas mode-${mode}`}
            style={
              imageUrl ? { backgroundImage: `url("${imageUrl}")` } : undefined
            }
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
          >
            {boxes.map((b) => (
              <i
                key={b.id}
                className={`edit-box${selected === b.id ? " selected" : ""}`}
                style={{
                  left: `${b.bbox[0] * 100}%`,
                  top: `${b.bbox[1] * 100}%`,
                  width: `${b.bbox[2] * 100}%`,
                  height: `${b.bbox[3] * 100}%`,
                  borderColor: b.color,
                }}
                onPointerDown={(e) => start(e, b, "move")}
              >
                <b style={{ background: b.color }}>{b.className}</b>
                {selected === b.id && (
                  <em onPointerDown={(e) => start(e, b, "resize")} />
                )}
              </i>
            ))}
          </div>
        </section>
        <aside className="reinspection-properties">
          <h2>객체 목록</h2>
          {boxes.map((b) => (
            <button
              key={b.id}
              className={selected === b.id ? "active" : ""}
              onClick={() => setSelected(b.id)}
            >
              <span>
                {b.className}
                {b.modified && <em>수정됨</em>}
              </span>
              <small>
                {b.manuallyAdded
                  ? "수동 추가"
                  : `AI 신뢰도 ${percent(b.confidence)}`}
                {b.originalClassName && b.originalClassName !== b.className
                  ? ` · ${b.originalClassName}에서 변경`
                  : ""}
              </small>
            </button>
          ))}
          {current && (
            <label>
              <span>폐기물 유형</span>
              <select
                value={current.className}
                onChange={(e) =>
                  patch(current.id, { className: e.target.value })
                }
              >
                {classes.map((c) => {
                  const val = c.name || c.className || c.id;
                  return (
                    <option key={c.id || val} value={val}>
                      {c.name || c.className || c.id}
                    </option>
                  );
                })}
              </select>
            </label>
          )}
        </aside>
      </div>
    </main>
  );
}
