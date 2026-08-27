"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { historyService } from "@/services/historyService";
import { getApiErrorMessage } from "@/services/apiClient";
import { STATUS_OPTIONS, statusClass } from "./historyData";

const formatDateTime = (value) =>
  new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
    hour12: false,
  }).format(new Date(value));

const roleLabel = {
  ADMIN: "관리자",
  MANAGER: "현장 관리자",
  INSPECTOR: "현장 점검자",
};

const formatCoordinates = (coords) => {
  if (!coords || coords === "좌표 미등록" || coords.includes("없음")) {
    return "좌표 미등록";
  }

  if (coords.includes("위도")) return coords;

  const matches = coords.match(/[-+]?[0-9]*\.?[0-9]+/g);
  if (matches && matches.length >= 2) {
    return `위도 : ${matches[0]} | 경도 : ${matches[1]}`;
  }

  return coords;
};

export default function HistoryDetailClient({
  history,
  detail,
  inspectionId = null,
}) {
  const localKey = `inspection_local_${history.id}`;

  const statusTranslateMap = {
    ANALYZING: "AI 분석 중",
    DRAFT: "점검 대기",
    REVIEW_REQUIRED: "진행 대기",
    ACTION_REQUIRED: "진행",
    RESOLVED: "완료",
    FAILED: "분석 실패",
  };

  const [status, setStatus] = useState(
    statusTranslateMap[history.status] || history.status,
  );

  const [opinion, setOpinion] = useState(detail.opinion);
  const [saved, setSaved] = useState(true);
  const [savingNotes, setSavingNotes] = useState(false);
  const [hasExistingOpinion, setHasExistingOpinion] = useState(
    Boolean(detail.opinion && detail.opinion.trim()),
  );

  const opinionRef = useRef(null);

  // 증빙 사진 State
  const [afterImage, setAfterImage] = useState(detail.afterImageUrl || null);
  const [afterFile, setAfterFile] = useState(null);
  const [savingPhoto, setSavingPhoto] = useState(false);
  const [completingWork, setCompletingWork] = useState(false);

  // 분석 실행 State
  const [analyzing, setAnalyzing] = useState(false);

  const [zoomImage, setZoomImage] = useState(null);
  const [assignmentOpen, setAssignmentOpen] = useState(false);
  const [assignees, setAssignees] = useState([]);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState("");
  const [assigneeName, setAssigneeName] = useState(
    detail.assigneeName || "담당자 미지정",
  );
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [assignmentError, setAssignmentError] = useState("");

  const [showMap, setShowMap] = useState(false);
  const [detectionModalOpen, setDetectionModalOpen] = useState(false); // 👈 팝업 State

  const rawCoords = detail.coordinates || "";
  const parsedCoords = (() => {
    if (!rawCoords || rawCoords === "좌표 미등록") return null;
    const matches = rawCoords.match(/[-+]?[0-9]*\.?[0-9]+/g);
    if (matches && matches.length >= 2) {
      return `${matches[0]},${matches[1]}`;
    }
    return rawCoords.trim();
  })();

  const fetchProofImage = async () => {
    const targetId = inspectionId || history.id;

    // detail에 증빙사진 정보가 아예 없으면 요청 자체를 보내지 않음
    if (!targetId || !detail?.afterImageUrl) return;

    try {
      const blob = await historyService.getHistoryImage(
        targetId,
        "COLLECTION_PROOF",
      );
      if (blob && blob.size > 0) {
        const objectUrl = URL.createObjectURL(blob);
        setAfterImage(objectUrl);
      }
    } catch (e) {
      // 이미지 미등록 상태 시 무시(404)
    }
  };

  useEffect(() => {
    fetchProofImage();
  }, [inspectionId, history.id]);

  useEffect(() => {
    try {
      const savedData = localStorage.getItem(localKey);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.assigneeName) setAssigneeName(parsed.assigneeName);
        if (parsed.status) setStatus(parsed.status);
        if (
          parsed.afterImage &&
          !parsed.afterImage.startsWith("blob:") &&
          !afterImage
        ) {
          setAfterImage(parsed.afterImage);
        }
      }
    } catch (e) {
      console.error("로컬 상태 불러오기 실패:", e);
    }
  }, [localKey]);

  const saveLocalState = (patch) => {
    try {
      const savedData = localStorage.getItem(localKey);
      const current = savedData ? JSON.parse(savedData) : {};
      const updated = { ...current, ...patch };

      if (updated.afterImage && updated.afterImage.startsWith("blob:")) {
        delete updated.afterImage;
      }

      localStorage.setItem(localKey, JSON.stringify(updated));
    } catch (e) {
      console.error("로컬 상태 저장 실패:", e);
    }
  };

  const source = detail.originalImageUrl;
  const isSameImage =
    !detail.annotatedImageUrl ||
    detail.annotatedImageUrl === source ||
    (source && detail.annotatedImageUrl.includes(source));
  const analyzedSource = isSameImage ? null : detail.annotatedImageUrl;
  const isProgressOrDone = status === "진행" || status === "완료";

  const handleCompleteWork = async () => {
    if (status === "대기") {
      alert(
        "상태가 대기상태입니다. 담당자를 지정하여 진행 상태를 변경해 주세요.",
      );
      return;
    }

    if (status !== "진행") {
      alert("이미 수거 작업이 완료된 점검 건입니다.");
      return;
    }

    if (!opinion || !opinion.trim()) {
      alert("점검 의견 및 후속 조치 내용을 입력해 주세요.");
      opinionRef.current?.focus();
      return;
    }

    if (!afterFile && !afterImage) {
      alert("수거 완료 증빙사진을 등록해 주세요.");
      return;
    }

    setCompletingWork(true);
    try {
      const targetId = inspectionId || history.id;
      if (targetId) {
        try {
          await historyService.completeHistory(targetId, afterFile);
        } catch (apiError) {
          console.warn(
            "서버 API 연결 실패, 클라이언트 상태만 완료 전환합니다:",
            apiError,
          );
        }
      }

      setStatus("완료");
      saveLocalState({ status: "완료" });
      alert("수거 작업이 완료되었습니다.");
    } catch (error) {
      alert(
        getApiErrorMessage(
          error,
          "수거 작업 완료 처리 중 오류가 발생했습니다.",
        ),
      );
    } finally {
      setCompletingWork(false);
    }
  };

  const handleSaveAfterPhoto = async () => {
    if (!afterFile) {
      alert("새로 첨부된 수거 완료 증빙사진 파일이 없습니다.");
      return;
    }

    const targetId = inspectionId || history.id;
    if (!targetId) {
      alert("점검 ID를 찾을 수 없습니다.");
      return;
    }

    setSavingPhoto(true);
    try {
      await historyService.uploadProofImage(targetId, afterFile);
      setAfterFile(null);
      await fetchProofImage();
      alert("수거 완료 증빙사진이 성공적으로 저장되었습니다.");
    } catch (error) {
      alert(getApiErrorMessage(error, "증빙사진 저장 중 오류가 발생했습니다."));
    } finally {
      setSavingPhoto(false);
    }
  };

  const handleRunAnalysis = async () => {
    const targetId = inspectionId || history.id;
    if (!targetId) {
      alert("서버에 저장된 점검건에서만 분석을 실행할 수 있습니다.");
      return;
    }

    setAnalyzing(true);
    try {
      await historyService.analyzeImage(targetId);
      alert("분석이 성공적으로 생성되었습니다.");
      window.location.reload();
    } catch (error) {
      alert(
        getApiErrorMessage(error, "수동 분석 실행 중 오류가 발생했습니다."),
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveNotes = async () => {
    const targetId = inspectionId || history.id;
    if (!targetId) {
      setSaved(true);
      return;
    }
    setSavingNotes(true);
    try {
      await historyService.updateNotes(targetId, opinion);
      setSaved(true);

      const actionText = hasExistingOpinion ? "수정" : "저장";
      alert(`점검 의견 및 후속 조치 내용이 ${actionText}되었습니다.`);

      if (opinion && opinion.trim()) {
        setHasExistingOpinion(true);
      }
    } catch (error) {
      alert(getApiErrorMessage(error, "점검 의견을 저장하지 못했습니다."));
    } finally {
      setSavingNotes(false);
    }
  };

  const openAssignment = async () => {
    const targetId = inspectionId || history.id;
    setAssignmentError(
      targetId ? "" : "서버에 저장된 점검에서만 담당자를 지정할 수 있습니다.",
    );
    setAssignmentOpen(true);
    if (!targetId || assignees.length) return;
    setAssignmentLoading(true);
    try {
      const items = await historyService.getAssignees();
      const list = Array.isArray(items) ? items : [];
      setAssignees(list);
      if (list.length) setSelectedAssigneeId(String(list[0].id));
    } catch (error) {
      setAssignmentError(
        getApiErrorMessage(error, "담당자 목록을 불러오지 못했습니다."),
      );
    } finally {
      setAssignmentLoading(false);
    }
  };

  const submitAssignment = async () => {
    if (!selectedAssigneeId) return;
    const targetId = inspectionId || history.id;
    if (!targetId) {
      setAssignmentError(
        "서버에 저장된 점검에서만 담당자를 지정할 수 있습니다.",
      );
      return;
    }

    setAssignmentLoading(true);
    setAssignmentError("");
    try {
      const result = await historyService.assignHistory(
        targetId,
        Number(selectedAssigneeId),
      );
      const targetName = result.assignee.name;
      setAssigneeName(targetName);
      setStatus("진행");
      saveLocalState({ assigneeName: targetName, status: "진행" });
      setAssignmentOpen(false);
      alert(`${targetName} 님이 담당자로 지정되었습니다. (상태: 진행)`);
    } catch (error) {
      setAssignmentError(
        getApiErrorMessage(error, "담당자를 지정하지 못했습니다."),
      );
    } finally {
      setAssignmentLoading(false);
    }
  };

  // 1. Detections 원본 데이터 파싱 및 고유 폐기물 집계
  const rawDetections = Array.isArray(detail?.detections)
    ? detail.detections
    : Array.isArray(history?.detections)
      ? history.detections
      : [];

  const parsedFromDetections = rawDetections
    .map((item) => {
      if (!item) return null;
      if (Array.isArray(item)) {
        const name = item[0] ? String(item[0]) : null;
        const count = Number(item[1]) || 1;
        return name ? { name, count } : null;
      }
      if (typeof item === "object") {
        const name =
          item.className ||
          item.class_name ||
          item.name_ko ||
          item.name ||
          item.waste_type_name ||
          item.label;
        const count = Number(item.count) || 1;
        return name ? { name: String(name), count } : null;
      }
      return { name: String(item), count: 1 };
    })
    .filter(Boolean);

  const wasteMap = new Map();
  if (parsedFromDetections.length > 0) {
    parsedFromDetections.forEach(({ name, count }) => {
      if (name) {
        wasteMap.set(name, (wasteMap.get(name) || 0) + count);
      }
    });
  } else {
    const rawSummary = detail?.wasteSummary || history?.waste || "";
    if (rawSummary && rawSummary !== "탐지 결과 없음") {
      rawSummary.split(",").forEach((s) => {
        const trimmed = s.trim();
        const match = trimmed.match(/^(.*?)\s*(\d+)개$/);
        if (match) {
          const name = match[1].trim();
          const count = Number(match[2]) || 1;
          wasteMap.set(name, (wasteMap.get(name) || 0) + count);
        } else if (trimmed) {
          wasteMap.set(trimmed, (wasteMap.get(trimmed) || 0) + 1);
        }
      });
    }
  }

  const uniqueWastes = Array.from(wasteMap.entries()).map(([name, count]) => ({
    name,
    count,
  }));

  // [테스트용 임시 코드]
  // const uniqueWastes = [
  //   { name: "중국산 플라스틱 부표", count: 4 },
  //   { name: "미국산 플라스틱 부표", count: 8 },
  //   { name: "플라스틱", count: 3 },
  //   { name: "캔류", count: 5 },
  //   { name: "폐목재", count: 2 },
  //   { name: "유리병", count: 6 },
  //   { name: "일본산 플라스틱 부표", count: 1 },
  //   { name: "종이박스", count: 7 },
  //   { name: "가전제품", count: 2 },
  //   { name: "고철류", count: 4 },
  //   { name: "의류", count: 3 },
  //   { name: "폐매트리스", count: 1 },
  //   { name: "폐가구", count: 2 },
  //   { name: "도자기류", count: 5 },
  //   { name: "형광등", count: 8 },
  //   { name: "폐건전지", count: 12 },
  //   { name: "폐비닐포대", count: 4 },
  //   { name: "한국산 플라스틱 부표", count: 3 },
  //   { name: "고무류", count: 2 },
  //   { name: "기타폐기물", count: 9 },
  // ];
  const totalCount = uniqueWastes.reduce((sum, item) => sum + item.count, 0);

  // 최대 10개 노출 (초과 시 9개 노출 + 10번째에 더보기 버튼)
  const MAX_DISPLAY = 10;
  const isOverflow = uniqueWastes.length > MAX_DISPLAY;
  const displayList = isOverflow ? uniqueWastes.slice(0, 9) : uniqueWastes;
  const hiddenCount = uniqueWastes.length - 19;

  // 정확히 반반(왼쪽 6개, 오른쪽 5~6개)으로 분할
  const leftColumnWastes = displayList.slice(0, 5);
  const rightColumnWastes = displayList.slice(5, 9);

  return (
    <div className="page-shell history-detail-page compact-detail-page">
      <div className="detail-header">
        <div>
          <div className="eyebrow">Inspection Detail</div>
          <h1>
            점검 상세 <span>#{history.id}</span>
          </h1>
          <p>점검 결과를 확인하고 후속 조치와 처리 상태를 관리하세요.</p>
        </div>
        <div className="detail-header-actions">
          <Link className="btn btn-primary" href="/histories">
            목록
          </Link>
          <label>
            처리 상태
            <select
              value={status}
              onChange={(event) => {
                const nextStatus = event.target.value;
                setStatus(nextStatus);
                saveLocalState({ status: nextStatus });
              }}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
          <button
            className="btn btn-primary"
            type="button"
            disabled={completingWork}
            onClick={handleCompleteWork}
          >
            {completingWork ? "처리 중..." : "수거 작업 완료 처리"}
          </button>
        </div>
      </div>

      {/* 원본, 분석 이미지 */}
      <div className="compact-top-grid">
        <article className="card compact-image-card">
          <div className="detail-image-grid">
            <DetailImage
              title="원본 이미지"
              src={source}
              downloadName={`inspection-${history.id}-original`}
              onZoom={setZoomImage}
            />
            <DetailImage
              title="분석 이미지"
              actionButton={
                <button
                  type="button"
                  className="btn btn-soft btn-sm"
                  disabled={analyzing}
                  onClick={handleRunAnalysis}
                >
                  {analyzing ? "분석 중..." : "분석"}
                </button>
              }
              src={analyzedSource}
              downloadName={`inspection-${history.id}-annotated`}
              analyzed
              onZoom={setZoomImage}
            />
          </div>
        </article>

        {/* 점검 요약 */}
        <article className="card compact-summary-card">
          <h2>점검 요약</h2>
          <div
            className="compact-meta-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gridTemplateRows: "repeat(3, auto)",
              gap: "12px 20px",
              alignItems: "stretch",
            }}
          >
            {/* ── 1행 (좌측 1열 / 중간 2열) ── */}
            <div style={{ gridColumn: "1 / 2", gridRow: "1 / 2" }}>
              <Meta
                label="처리 상태"
                value={
                  <span className={`badge ${statusClass(status)}`}>
                    {status}
                  </span>
                }
              />
            </div>
            <div style={{ gridColumn: "2 / 3", gridRow: "1 / 2" }}>
              <Meta label="점검자" value={detail.inspector} />
            </div>

            {/* ── 2행 (좌측 1열 / 중간 2열) ── */}
            <div style={{ gridColumn: "1 / 2", gridRow: "2 / 3" }}>
              <Meta label="점검 장소" value={detail.fullLocation} />
            </div>
            <div style={{ gridColumn: "2 / 3", gridRow: "2 / 3" }}>
              <Meta
                label="점검 일시"
                value={formatDateTime(history.inspectedAt)}
              />
            </div>

            {/* ── 3행 (좌측 1열 / 중간 2열) ── */}
            <div style={{ gridColumn: "1 / 2", gridRow: "3 / 4" }}>
              <Meta
                label="GPS 좌표"
                value={formatCoordinates(detail.coordinates)}
              />
            </div>
            <div style={{ gridColumn: "2 / 3", gridRow: "3 / 4" }}>
              <Meta
                label="현장 위치"
                value={
                  parsedCoords ? (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        width: "100%",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setShowMap((prev) => !prev)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          padding: "4px 8px",
                          fontSize: "0.82rem",
                          fontWeight: 600,
                          color: showMap ? "#2563eb" : "#4b5563",
                          background: "transparent",
                          border: "1px solid",
                          borderColor: showMap ? "#bfdbfe" : "#e5e7eb",
                          borderRadius: "6px",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span>{showMap ? "지도 닫기" : "위치 확인"}</span>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{
                            transform: showMap
                              ? "rotate(180deg)"
                              : "rotate(0deg)",
                            transition: "transform 0.2s ease",
                          }}
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <span
                      style={{
                        display: "inline-block",
                        marginTop: "4px",
                        color: "#9ca3af",
                        fontSize: "0.85rem",
                      }}
                    >
                      좌표 없음
                    </span>
                  )
                }
              />
            </div>

            {/* ── 우측 3열 (탐지 결과: 2열 반반 10개 노출 + 더보기) ── */}
            <div
              style={{
                gridColumn: "3 / 4",
                gridRow: "1 / 4",
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              {/* 상단 라벨 & 총계 뱃지 */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  minHeight: "1.2rem",
                }}
              >
                <small>탐지 결과</small>
                {uniqueWastes.length > 0 && (
                  <span
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      color: "#2563eb",
                      backgroundColor: "#eff6ff",
                      padding: "2px 8px",
                      borderRadius: "9999px",
                      border: "1px solid #dbeafe",
                      display: "inline-flex",
                      alignItems: "center",
                      lineHeight: 1.2,
                    }}
                  >
                    총 {totalCount}개 ({uniqueWastes.length}종)
                  </span>
                )}
              </div>

              {/* 하단 50:50 2열 세로 정렬 영역 (각 열 5개씩 총 10개) */}
              <div
                style={{
                  marginTop: "8px",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {uniqueWastes.length === 0 ? (
                  <span
                    style={{
                      color: "#9ca3af",
                      fontSize: "0.88rem",
                      marginTop: "4px",
                    }}
                  >
                    탐지 결과 없음
                  </span>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr", // 👈 좌우 50% : 50% 분할
                      gap: "0 10px",
                      width: "100%",
                    }}
                  >
                    {/* ── 좌측 1열 (최대 5개) ── */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                        alignItems: "flex-start",
                      }}
                    >
                      {leftColumnWastes.map(({ name, count }, index) => (
                        <div
                          key={`left-${name}-${index}`}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "3px 10px 3px 8px",
                            backgroundColor: "#ffffff",
                            border: "1px solid #e2e8f0",
                            borderRadius: "9999px",
                            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.85rem",
                              fontWeight: 800,
                              color: "#3b82f6",
                            }}
                          >
                            #
                          </span>
                          <span
                            style={{
                              fontSize: "0.84rem",
                              fontWeight: 600,
                              color: "#1e293b",
                            }}
                          >
                            {name}
                          </span>
                          <span
                            style={{
                              fontSize: "0.8rem",
                              fontWeight: 700,
                              color: "#64748b",
                              marginLeft: "2px",
                            }}
                          >
                            {count}개
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* ── 우측 2열 (최대 4개 + 더보기 버튼) ── */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                        alignItems: "flex-start",
                      }}
                    >
                      {rightColumnWastes.map(({ name, count }, index) => (
                        <div
                          key={`right-${name}-${index}`}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "3px 10px 3px 8px",
                            backgroundColor: "#ffffff",
                            border: "1px solid #e2e8f0",
                            borderRadius: "9999px",
                            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.85rem",
                              fontWeight: 800,
                              color: "#3b82f6",
                            }}
                          >
                            #
                          </span>
                          <span
                            style={{
                              fontSize: "0.84rem",
                              fontWeight: 600,
                              color: "#1e293b",
                            }}
                          >
                            {name}
                          </span>
                          <span
                            style={{
                              fontSize: "0.8rem",
                              fontWeight: 700,
                              color: "#64748b",
                              marginLeft: "2px",
                            }}
                          >
                            {count}개
                          </span>
                        </div>
                      ))}

                      {/* 11개 이상일 때 우측 5번째(전체 10번째) 자리에 나타나는 더보기 버튼 */}
                      {isOverflow && (
                        <button
                          type="button"
                          onClick={() => setDetectionModalOpen(true)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "3px",
                            padding: "3px 10px",
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            color: "#2563eb",
                            backgroundColor: "#eff6ff",
                            border: "1px dashed #bfdbfe",
                            borderRadius: "9999px",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                        >
                          <span>+{hiddenCount}개 더보기</span>
                          <svg
                            width="11"
                            height="11"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 지도 보기를 눌렀을 때 펼쳐지는 지도 뷰어 */}
          {showMap && parsedCoords && (
            <div
              style={{
                marginTop: "16px",
                borderRadius: "12px",
                overflow: "hidden",
                border: "1px solid #e2e8f0",
                height: "350px",
                position: "relative",
              }}
            >
              <iframe
                title="현장 GPS 위치 지도"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(parsedCoords)}&hl=ko&z=17&output=embed`}
              />
            </div>
          )}
        </article>
      </div>

      {/* 수거 완료 증빙 사진 */}
      <div className="compact-action-grid">
        <article className="card card-pad after-card">
          <div className="detail-card-title">
            <h2>수거 완료 증빙 사진</h2>
            <button
              className="btn btn-primary"
              type="button"
              disabled={savingPhoto || !afterFile}
              onClick={handleSaveAfterPhoto}
            >
              {savingPhoto ? "저장 중..." : "저장"}
            </button>
          </div>
          <label className="after-photo-upload">
            {afterImage ? (
              <img
                src={afterImage}
                alt="수거 완료 증빙 사진"
                onError={() => {
                  setAfterImage(null);
                }}
              />
            ) : (
              <>
                <b>+ 사진 등록</b>
                <span>수거 완료 후 현장 사진을 첨부하세요.</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  const tempUrl = URL.createObjectURL(file);
                  setAfterFile(file);
                  setAfterImage(tempUrl);
                }
              }}
            />
          </label>
        </article>

        {/* 점검 의견 및 후속 조치 */}
        <article className="card card-pad opinion-card">
          <div className="detail-card-title">
            <h2>점검 의견 및 후속 조치</h2>
            <button
              className="btn btn-primary"
              type="button"
              disabled={savingNotes}
              onClick={handleSaveNotes}
            >
              {savingNotes ? "저장 중..." : "저장"}
            </button>
          </div>
          <textarea
            ref={opinionRef}
            value={opinion}
            onChange={(event) => {
              setOpinion(event.target.value);
              setSaved(false);
            }}
          />
          <small>
            {saved ? "저장된 내용입니다." : "수정된 내용이 있습니다."}
          </small>
        </article>
      </div>

      <article className="card card-pad detail-process">
        <div className="detail-card-title">
          <h2>처리 이력</h2>
          <button
            className="btn btn-soft"
            type="button"
            onClick={openAssignment}
          >
            담당자 지정
          </button>
        </div>
        <div className="detail-process-steps">
          <Step label="1단계 · 점검 등록" value="AI 점검 결과 저장" />
          <Step label="2단계 · 담당자 배정" value={assigneeName} />
          <Step
            label="3단계 · 수거/조치"
            value={isProgressOrDone ? "진행" : "대기"}
          />
          <Step
            label="4단계 · 완료"
            value={status === "완료" ? "완료" : "대기"}
          />
        </div>
      </article>

      {/* ── 탐지 결과 전체보기 팝업 모달 ── */}
      {detectionModalOpen && (
        <div
          className="assignment-modal"
          role="dialog"
          aria-modal="true"
          onClick={() => setDetectionModalOpen(false)}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{ maxWidth: "480px", width: "90%" }}
          >
            <div className="assignment-modal-header">
              <div>
                <h2>탐지 결과 전체 목록</h2>
                <p>
                  총 <strong>{uniqueWastes.length}</strong>종 ·{" "}
                  <strong>{totalCount}</strong>개의 폐기물이 탐지되었습니다.
                </p>
              </div>
              <button
                type="button"
                aria-label="닫기"
                onClick={() => setDetectionModalOpen(false)}
              >
                ×
              </button>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                maxHeight: "320px",
                overflowY: "auto",
                padding: "16px",
                backgroundColor: "#f8fafc",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
              }}
            >
              {uniqueWastes.map(({ name, count }, index) => (
                <div
                  key={`modal-${name}-${index}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 12px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #cbd5e1",
                    borderRadius: "9999px",
                    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: 800,
                      color: "#3b82f6",
                    }}
                  >
                    #
                  </span>
                  <span
                    style={{
                      fontSize: "0.88rem",
                      fontWeight: 600,
                      color: "#1e293b",
                    }}
                  >
                    {name}
                  </span>
                  <span
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      color: "#2563eb",
                      backgroundColor: "#eff6ff",
                      padding: "2px 7px",
                      borderRadius: "6px",
                      border: "1px solid #dbeafe",
                      marginLeft: "2px",
                    }}
                  >
                    {count}개
                  </span>
                </div>
              ))}
            </div>

            <div
              className="assignment-modal-actions"
              style={{ marginTop: "16px" }}
            >
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => setDetectionModalOpen(false)}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 담당자 지정 모달 */}
      {assignmentOpen && (
        <div
          className="assignment-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="assignment-title"
          onClick={() => setAssignmentOpen(false)}
        >
          <div onClick={(event) => event.stopPropagation()}>
            <div className="assignment-modal-header">
              <div>
                <h2 id="assignment-title">담당자 지정</h2>
                <p>후속 수거 작업을 담당할 사용자를 선택하세요.</p>
              </div>
              <button
                type="button"
                aria-label="닫기"
                onClick={() => setAssignmentOpen(false)}
              >
                ×
              </button>
            </div>
            {assignmentLoading && !assignees.length ? (
              <p className="assignment-state">
                담당자 목록을 불러오는 중입니다.
              </p>
            ) : assignees.length ? (
              <div className="assignee-list">
                {assignees.map((assignee) => (
                  <label
                    key={assignee.id}
                    className={
                      selectedAssigneeId === String(assignee.id)
                        ? "selected"
                        : ""
                    }
                  >
                    <input
                      type="radio"
                      name="assignee"
                      value={assignee.id}
                      checked={selectedAssigneeId === String(assignee.id)}
                      onChange={(event) =>
                        setSelectedAssigneeId(event.target.value)
                      }
                    />
                    <span>
                      <strong>{assignee.name}</strong>
                      <small>{roleLabel[assignee.role] || assignee.role}</small>
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              !assignmentError && (
                <p className="assignment-state">
                  지정할 수 있는 활성 담당자가 없습니다.
                </p>
              )
            )}
            {assignmentError && (
              <p className="assignment-error">{assignmentError}</p>
            )}
            <div className="assignment-modal-actions">
              <button
                className="btn btn-soft"
                type="button"
                onClick={() => setAssignmentOpen(false)}
              >
                취소
              </button>
              <button
                className="btn btn-primary"
                type="button"
                disabled={assignmentLoading || !selectedAssigneeId}
                onClick={submitAssignment}
              >
                {assignmentLoading && assignees.length
                  ? "저장 중..."
                  : "담당자 지정"}
              </button>
            </div>
          </div>
        </div>
      )}

      {zoomImage && (
        <div className="detail-image-modal" onClick={() => setZoomImage(null)}>
          <div onClick={(event) => event.stopPropagation()}>
            <button onClick={() => setZoomImage(null)}>×</button>
            <img src={zoomImage} alt="점검 이미지 확대" />
          </div>
        </div>
      )}
    </div>
  );
}

function DetailImage({
  title,
  actionButton,
  src,
  downloadName,
  analyzed,
  onZoom,
}) {
  const [hasError, setHasError] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "36px",
          marginBottom: "8px",
        }}
      >
        <h3 style={{ margin: 0, lineHeight: "36px" }}>{title}</h3>
        {actionButton ? (
          actionButton
        ) : (
          <div style={{ height: "32px", width: "1px", visibility: "hidden" }} />
        )}
      </div>

      {src && !hasError ? (
        <div
          className={`detail-image${analyzed ? " analyzed" : ""}`}
          style={{
            position: "relative",
            width: "100%",
            height: "220px",
            borderRadius: "12px",
            overflow: "hidden",
            backgroundColor: "#f8fafc",
          }}
        >
          <Image
            src={src}
            alt={typeof title === "string" ? title : "점검 이미지"}
            fill
            unoptimized
            sizes="(max-width: 720px) 100vw, 50vw"
            style={{ objectFit: "contain" }}
          />
          <div>
            <button type="button" onClick={() => onZoom(src)}>
              확대
            </button>
            <a href={src} download={downloadName}>
              다운로드
            </a>
          </div>
          <span>{analyzed ? "AI 분석 결과" : "현장 촬영 이미지"}</span>
        </div>
      ) : (
        <div
          className="detail-image-empty"
          style={{
            height: "220px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <strong>{title} 없음</strong>
          <span>
            {analyzed
              ? "AI 분석 결과 이미지가 저장되지 않았습니다."
              : "원본 이미지가 저장되지 않았습니다."}
          </span>
        </div>
      )}
    </div>
  );
}

function Meta({ label, value }) {
  return (
    <div>
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  );
}

function Step({ label, value }) {
  return (
    <div>
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  );
}
