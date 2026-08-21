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

export default function HistoryDetailClient({
  history,
  detail,
  inspectionId = null,
}) {
  const localKey = `inspection_local_${history.id}`;

  const statusTranslateMap = {
    DRAFT: "분석 대기",
    REVIEW_REQUIRED: "진행 대기",
    RESOLVED: "진행",
    COMPLETED: "완료",
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

  // 등록된 수거 완료 증빙사진(COLLECTION_PROOF) 불러오기
  const fetchProofImage = async () => {
    const targetId = inspectionId || history.id;
    if (!targetId) return;

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
      // 이미지 미등록 상태 시 무시
    }
  };

  useEffect(() => {
    fetchProofImage();
  }, [inspectionId, history.id]);

  // 로컬 환경 새로고침 대응 (blob: URL은 제외하고 복원)
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(localKey);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.assigneeName) setAssigneeName(parsed.assigneeName);
        if (parsed.status) setStatus(parsed.status);
        // 만료된 blob: URL이 아닌 실제 이미지 URL만 복원
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

  // 로컬 상태 저장 헬퍼 (blob: URL 저장 방지)
  const saveLocalState = (patch) => {
    try {
      const savedData = localStorage.getItem(localKey);
      const current = savedData ? JSON.parse(savedData) : {};
      const updated = { ...current, ...patch };

      // 임시 blob 주소는 localStorage에 저장하지 않음
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
  // const currentStep =
  //   status === "완료" ? "완료" : status === "진행" ? "진행" : "대기";
  const isProgressOrDone = status === "진행" || status === "완료";

  // 수거 작업 완료 처리 클릭 핸들러
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

  // 수거 완료 증빙사진 저장 핸들러
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

  // 수동 분석 실행 핸들러
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
    } catch (error) {
      alert(
        getApiErrorMessage(error, "수동 분석 실행 중 오류가 발생했습니다."),
      );
    } finally {
      setAnalyzing(false);
    }
  };

  // 점검 의견 저장 핸들러
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
    setAssignmentLoading(true);
    setAssignmentError("");

    let targetName = assigneeName;
    const targetId = inspectionId || history.id;

    try {
      if (targetId) {
        const result = await historyService.assignHistory(
          targetId,
          Number(selectedAssigneeId),
        );
        targetName = result.assignee.name;
      } else {
        const selectedObj = assignees.find(
          (a) => String(a.id) === String(selectedAssigneeId),
        );
        if (selectedObj) targetName = selectedObj.name;
      }
    } catch (error) {
      console.warn("담당자 지정 API 실패, 로컬 상태만 반영합니다:", error);
      const selectedObj = assignees.find(
        (a) => String(a.id) === String(selectedAssigneeId),
      );
      if (selectedObj) targetName = selectedObj.name;
    } finally {
      setAssigneeName(targetName);
      setStatus("진행");

      saveLocalState({
        assigneeName: targetName,
        status: "진행",
      });

      setAssignmentOpen(false);
      setAssignmentLoading(false);
      alert(`${targetName} 님이 담당자로 지정되었습니다. (상태: 진행)`);
    }
  };

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
          <div className="compact-meta-grid">
            <Meta
              label="처리 상태"
              value={
                <span className={`badge ${statusClass(status)}`}>{status}</span>
              }
            />
            <Meta
              label="점검 일시"
              value={formatDateTime(history.inspectedAt)}
            />
            <Meta label="점검 장소" value={detail.fullLocation} />
            <Meta label="점검자" value={detail.inspector} />
            <Meta
              label="GPS 좌표"
              value={detail.coordinates || "좌표 미등록"}
            />
            <Meta
              label="현장 위치"
              value={
                <a
                  href={`https://www.google.com/maps/place/${detail.coordinates}/@${detail.coordinates},18z`}
                  target="_blank"
                  rel="noreferrer"
                >
                  지도 보기
                </a>
              }
            />
          </div>
        </article>

        {/* 탐지 결과 */}
        <article className="card compact-summary-card">
          <div className="detail-card-title">
            <h2>탐지 결과</h2>
            <div className="detection-tags">
              {detail.detections.map(([name, count]) => (
                <span key={name}>
                  {name} <b>{count}개</b>
                </span>
              ))}
            </div>
          </div>
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
                  // 만료되거나 파손된 이미지 주소일 경우 자동 복구
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

// 원본 / 분석 이미지 높이 및 비율 완전 통일 컴포넌트
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
            height: "220px", // 분석 이미지 없음 박스와 높이 동일 맞춤
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
            style={{ objectFit: "contain" }} // 이미지가 잘리지 않게 영역 내 맞춤
            onError={() => setHasError(true)}
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
