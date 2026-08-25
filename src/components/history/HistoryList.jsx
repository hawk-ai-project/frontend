"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { STATUS_OPTIONS, statusClass } from "./historyData";
import { historyService } from "@/services/historyService";

// 백엔드 상태 영문 코드를 UI용 한글 레이블로 매핑
const STATUS_LABEL_MAP = {
  DRAFT: "점검 대기",
  ACTION_REQUIRED: "조치 필요",
  IN_PROGRESS: "조치 중",
  COMPLETED: "조치 완료",
  ON_HOLD: "보류",
};

const getStatusLabel = (status) => {
  if (!status) return "점검 대기";
  return STATUS_LABEL_MAP[status] || status;
};

const formatDateTime = (value) => {
  if (!value || value === "-") return "-";

  try {
    const rawDateStr = String(value).replace(/\.\s?/g, "-").replace(" ", "T");
    const dateObj = new Date(rawDateStr);

    if (isNaN(dateObj.getTime())) {
      return value;
    }

    // YYYY. M. D. HH:mm 형식으로 출력
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    const date = dateObj.getDate();
    const hours = String(dateObj.getHours()).padStart(2, "0");
    const minutes = String(dateObj.getMinutes()).padStart(2, "0");

    return `${year}. ${month}. ${date}. ${hours}:${minutes}`;
  } catch {
    return value;
  }
};

const PAGE_SIZE = 10;
const imageCache = new Map();

export default function HistoryList({
  items = [],
  isLoading = false,
  isDeleting = false,
  searched,
  onDeleteSelected,
  onUpdateStatus,
}) {
  const [selected, setSelected] = useState([]);
  const [bulkStatus, setBulkStatus] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
    setSelected([]);
  }, [searched]);

  const filteredItems = useMemo(() => {
    if (!searched) return items;

    return items.filter((item) => {
      // 1. 키워드 필터링
      const matchesKeyword =
        !searched.keyword ||
        `${item.id || ""} ${item.location || ""}`
          .toLowerCase()
          .includes(searched.keyword.toLowerCase());

      // 2. 지역 필터링
      const selectedRegionObj = (searched.regions || []).find(
        (r) => String(r.id) === String(searched.locationId),
      );

      const matchesLocation =
        !searched.locationId ||
        String(item.locationId) === String(searched.locationId) ||
        String(item.regionId) === String(searched.locationId) ||
        (selectedRegionObj &&
          item.location?.includes(selectedRegionObj.name)) ||
        (isNaN(Number(searched.locationId))
          ? Boolean(
              item.location && item.location.includes(searched.locationId),
            )
          : true);

      // 3. 주요 폐기물 필터링
      const targetWaste = (searched.waste || "").trim().toLowerCase();
      const itemWasteList = (item.wasteTypes || []).map((w) =>
        String(w).toLowerCase(),
      );

      const matchesWaste =
        !searched.waste ||
        searched.waste === "전체 폐기물" ||
        itemWasteList.some((w) => w.includes(targetWaste)) ||
        (item.waste && String(item.waste).toLowerCase().includes(targetWaste));

      // 4. 상태 필터링 (한글/영문 모두 비교 가능하도록 처리)
      const mappedStatus = getStatusLabel(item.status);
      const matchesStatus =
        !searched.status ||
        searched.status === "전체 상태" ||
        item.status === searched.status ||
        mappedStatus === searched.status;

      // 5. 날짜 범위 필터링
      let matchesDate = true;
      if (searched.startDate || searched.endDate) {
        const rawDate = item.inspectedAt || item.capturedAt;
        if (!rawDate) {
          matchesDate = false;
        } else {
          const rawDateStr = String(rawDate)
            .replace(/\.\s?/g, "-")
            .replace(" ", "T");
          const itemTime = new Date(rawDateStr).getTime();

          if (searched.startDate) {
            const startTime = new Date(
              `${searched.startDate}T00:00:00`,
            ).getTime();
            if (!isNaN(startTime) && itemTime < startTime) matchesDate = false;
          }
          if (searched.endDate) {
            const endTime = new Date(
              `${searched.endDate}T23:59:59.999`,
            ).getTime();
            if (!isNaN(endTime) && itemTime > endTime) matchesDate = false;
          }
        }
      }

      // 6. 폐기물 유무 검사
      const count =
        item.detectedCount ?? item.detectionCount ?? item.detection_count ?? 0;
      const matchesHasWaste = !searched.hasWaste || count > 0;

      return (
        matchesKeyword &&
        matchesLocation &&
        matchesWaste &&
        matchesStatus &&
        matchesDate &&
        matchesHasWaste
      );
    });
  }, [items, searched]);

  const pageCount = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const pagedItems = filteredItems.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const allSelected =
    pagedItems.length > 0 &&
    pagedItems.every((item) => selected.includes(item.id));

  const toggleAll = () =>
    setSelected((current) =>
      allSelected
        ? current.filter((id) => !pagedItems.some((item) => item.id === id))
        : [...new Set([...current, ...pagedItems.map((item) => item.id)])],
    );

  const toggleItem = (id) =>
    setSelected((current) =>
      current.includes(id)
        ? current.filter((itemId) => itemId !== id)
        : [...current, id],
    );

  const applyStatus = () => {
    if (!bulkStatus || !selected.length) return;
    onUpdateStatus(selected, bulkStatus);
    setSelected([]);
    setBulkStatus("");
  };

  const deleteSelected = () => {
    const targets = items.filter(
      (item) => selected.includes(item.id) && item.inspectionId,
    );
    if (!targets.length || isDeleting) return;

    if (
      window.confirm(`선택한 점검 이력 ${targets.length}건을 삭제하시겠습니까?`)
    ) {
      onDeleteSelected(targets.map((t) => t.inspectionId));
      setSelected([]);
    }
  };

  return (
    <article className="card card-pad">
      <div className="bulk-toolbar">
        <div>
          <b>{selected.length}건 선택</b>
          <span>선택한 점검의 상태를 일괄 변경할 수 있습니다.</span>
        </div>
        <div className="bulk-actions">
          <select
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value)}
            aria-label="변경할 상태"
          >
            <option value="">상태 선택</option>
            {STATUS_OPTIONS.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
          <button
            className="btn btn-primary"
            type="button"
            disabled={!bulkStatus || !selected.length}
            onClick={applyStatus}
          >
            상태 변경
          </button>
        </div>
      </div>

      <div className="table-wrap">
        <table className="history-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="전체 선택"
                />
              </th>
              <th>이미지</th>
              <th>점검번호</th>
              <th>점검 일시</th>
              <th>장소</th>
              <th>탐지 수</th>
              <th>주요 폐기물</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="history-empty" colSpan="8">
                  불러오는 중...
                </td>
              </tr>
            ) : pagedItems.length ? (
              pagedItems.map((item) => {
                const displayStatus = getStatusLabel(item.status);
                return (
                  <tr
                    className={selected.includes(item.id) ? "selected" : ""}
                    key={item.id}
                  >
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.includes(item.id)}
                        onChange={() => toggleItem(item.id)}
                        aria-label={`${item.id} 선택`}
                      />
                    </td>
                    <td>
                      <HistoryThumbnail inspectionId={item.inspectionId} />
                    </td>
                    <td>
                      <Link
                        className="history-link"
                        href={`/histories/${item.inspectionId}`}
                      >
                        {item.id}
                      </Link>
                    </td>
                    <td>{formatDateTime(item.inspectedAt)}</td>
                    <td>{item.location}</td>
                    <td>{item.detectedCount ?? 0}개</td>
                    <td>{item.waste || "탐지 결과 없음"}</td>
                    <td>
                      <span className={`badge ${statusClass(displayStatus)}`}>
                        {displayStatus}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td className="history-empty" colSpan="8">
                  조건에 맞는 점검 이력이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <nav className="number-pagination" aria-label="점검 이력 페이지">
        <button
          className="pagination-arrow"
          type="button"
          aria-label="이전 페이지"
          title="이전 페이지"
          disabled={page === 1}
          onClick={() => setPage((v) => v - 1)}
        >
          <span aria-hidden="true">‹</span>
        </button>
        {Array.from({ length: pageCount }, (_, index) => index + 1).map(
          (number) => (
            <button
              type="button"
              key={number}
              aria-label={`${number}페이지`}
              aria-current={page === number ? "page" : undefined}
              className={page === number ? "active" : ""}
              onClick={() => setPage(number)}
            >
              {number}
            </button>
          ),
        )}
        <button
          className="pagination-arrow"
          type="button"
          aria-label="다음 페이지"
          title="다음 페이지"
          disabled={page === pageCount}
          onClick={() => setPage((v) => v + 1)}
        >
          <span aria-hidden="true">›</span>
        </button>
        <span className="history-list-actions">
          <button
            className="history-delete-button"
            type="button"
            disabled={!selected.length || isDeleting}
            onClick={deleteSelected}
          >
            {isDeleting ? "삭제 중..." : "삭제"}
          </button>
          <span className="history-total-count">
            전체 {filteredItems.length}건
          </span>
        </span>
      </nav>
    </article>
  );
}

function HistoryThumbnail({ inspectionId }) {
  const [src, setSrc] = useState(() => imageCache.get(inspectionId) || null);
  const [loading, setLoading] = useState(!imageCache.has(inspectionId));

  useEffect(() => {
    if (!inspectionId) {
      setLoading(false);
      return;
    }

    if (imageCache.has(inspectionId)) {
      setSrc(imageCache.get(inspectionId));
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);

    const load = async () => {
      try {
        let blob;
        try {
          blob = await historyService.getHistoryImage(
            inspectionId,
            "ANNOTATED",
          );
        } catch {
          blob = await historyService.getHistoryImage(inspectionId, "ORIGINAL");
        }
        if (!active) return;

        const objectUrl = URL.createObjectURL(blob);
        imageCache.set(inspectionId, objectUrl);
        setSrc(objectUrl);
      } catch (err) {
        console.error(`이미지 로드 실패 (ID: ${inspectionId})`, err);
        if (active) setSrc("/images/home/main-analysis.png");
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [inspectionId]);

  return (
    <span className="history-thumb">
      {loading ? (
        <span
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            backgroundColor: "#f0f0f0",
            borderRadius: "4px",
          }}
        />
      ) : (
        <Image
          src={src || "/images/home/main-analysis.png"}
          alt="AI 분석 이미지"
          fill
          unoptimized
          sizes="52px"
        />
      )}
    </span>
  );
}
