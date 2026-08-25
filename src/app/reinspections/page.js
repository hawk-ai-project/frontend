"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ErrorMessage from "@/components/common/ErrorMessage";
import { historyService } from "@/services/historyService";
import { getApiErrorMessage } from "@/services/apiClient";
import "./reinspections.css";

const COLORS = ["#36a2eb", "#ff6384", "#4bc0c0", "#ff9f40", "#9966ff"];
const PAGE_SIZE = 6;

const formatDate = (value) => {
  if (!value || value === "-") return "-";
  try {
    return new Intl.DateTimeFormat("ko-KR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
};

// detections 하위 호환 파싱 함수
const parseDetections = (rawDetections) => {
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

  return list.map((item, idx) => {
    // bbox 배열 형태 [x, y, w, h] 또는 개별 필드 대응
    const bbox = Array.isArray(item.bbox) ? item.bbox : [];
    const x = item.bboxX ?? item.x ?? bbox[0] ?? 0;
    const y = item.bboxY ?? item.y ?? bbox[1] ?? 0;
    const w = item.bboxWidth ?? item.w ?? bbox[2] ?? 0;
    const h = item.bboxHeight ?? item.h ?? bbox[3] ?? 0;

    return {
      id: item.id ?? item.detectionId ?? idx,
      className: item.className || item.name_ko || item.label || "미지정",
      confidence: item.confidence ?? item.score ?? 0,
      bboxX: Number(x),
      bboxY: Number(y),
      bboxWidth: Number(w),
      bboxHeight: Number(h),
    };
  });
};

function ReviewCard({ item, checked, onCheck }) {
  const [imageUrl, setImageUrl] = useState("");
  const targetId = item.inspectionId || item.id;
  const detections = parseDetections(item.detections);

  useEffect(() => {
    let url = "";
    let active = true;
    if (!targetId) return;

    historyService
      .getHistoryImage(targetId, "ORIGINAL")
      .then((blob) => {
        if (active) {
          url = URL.createObjectURL(blob);
          setImageUrl(url);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [targetId]);

  return (
    <article className={`reinspection-card${checked ? " selected" : ""}`}>
      <div
        className="reinspection-image"
        style={imageUrl ? { backgroundImage: `url("${imageUrl}")` } : undefined}
      >
        {!imageUrl && <span>IMAGE</span>}
        {detections.map((box, index) => (
          <i
            key={box.id}
            className="reinspection-box"
            style={{
              left: `${Number(box.bboxX) * 100}%`,
              top: `${Number(box.bboxY) * 100}%`,
              width: `${Number(box.bboxWidth) * 100}%`,
              height: `${Number(box.bboxHeight) * 100}%`,
              borderColor: COLORS[index % COLORS.length],
            }}
          >
            <b style={{ background: COLORS[index % COLORS.length] }}>
              {box.className}
            </b>
          </i>
        ))}
        <label className="reinspection-check">
          <input
            type="checkbox"
            checked={checked}
            onChange={() => onCheck(targetId)}
          />
          <span>검수 완료</span>
        </label>
      </div>
      <div className="reinspection-card-body">
        <small>
          #{targetId} ·{" "}
          {formatDate(item.capturedAt || item.createdAt || item.inspectedAt)}
        </small>
        <h2>{item.title || item.location || "점검 항목"}</h2>
        <p>{item.location || "위치 정보 없음"}</p>
        <div className="reinspection-labels">
          {detections.map((box) => (
            <span key={box.id}>
              {box.className}{" "}
              <b>{Math.round(Number(box.confidence || 0) * 100)}%</b>
            </span>
          ))}
          {!detections.length && <span>탐지 객체 없음</span>}
        </div>
        <footer>
          <span>{item.status || "점검 대기"}</span>
          <Link href={`/reinspections/${targetId}`}>직접 라벨링</Link>
        </footer>
      </div>
    </article>
  );
}

export default function ReinspectionsPage() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await historyService.getReinspectionTargets();
      setItems(Array.isArray(data) ? data : []);
      setError("");
    } catch (e) {
      setError(getApiErrorMessage(e, "재점검 대상을 불러오지 못했습니다."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => void load(), 0);
    return () => clearTimeout(timer);
  }, []);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedItems = items.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const toggle = (id) =>
    setSelected((value) =>
      value.includes(id) ? value.filter((item) => item !== id) : [...value, id],
    );

  const save = async () => {
    if (!selected.length) return;
    setSaving(true);
    try {
      await historyService.approveReinspectionTargets(selected);
      setSelected([]);
      await load();
    } catch (e) {
      setError(getApiErrorMessage(e, "상태 변경에 실패했습니다."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="page-shell reinspection-page">
      <header className="reinspection-head">
        <div>
          <span>FIELD REVIEW</span>
          <h1>재점검 대상이력</h1>
          <p>
            AI 라벨을 확인하고 검수 완료된 이미지를 진행 대기 상태로 전환합니다.
          </p>
        </div>
        <button
          className="btn btn-primary"
          disabled={!selected.length || saving}
          onClick={save}
        >
          {saving
            ? "저장 중..."
            : `선택 저장${selected.length ? ` (${selected.length})` : ""}`}
        </button>
      </header>
      <ErrorMessage message={error} />
      {loading ? (
        <div className="reinspection-empty">
          재점검 대상을 불러오는 중입니다.
        </div>
      ) : (
        <>
          <section className="reinspection-grid">
            {pagedItems.map((item) => {
              const targetId = item.inspectionId || item.id;
              return (
                <ReviewCard
                  key={targetId}
                  item={item}
                  checked={selected.includes(targetId)}
                  onCheck={toggle}
                />
              );
            })}
            {!items.length && (
              <div className="reinspection-empty">
                점검 대기 중인 이미지가 없습니다.
              </div>
            )}
          </section>
          <nav
            className="reinspection-pagination"
            aria-label="재점검 대상 페이지"
          >
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage((value) => value - 1)}
            >
              이전
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (pageNumber) => (
                <button
                  type="button"
                  key={pageNumber}
                  className={pageNumber === currentPage ? "active" : ""}
                  aria-current={pageNumber === currentPage ? "page" : undefined}
                  onClick={() => setPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              ),
            )}
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((value) => value + 1)}
            >
              다음
            </button>
            <span>총 {items.length.toLocaleString()}건</span>
          </nav>
        </>
      )}
    </main>
  );
}
