"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { STATUS_OPTIONS, statusClass } from "./historyData";
import { historyService } from "@/services/historyService";

const formatDateTime = (value) =>
  new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
    hour12: false,
  }).format(new Date(value));

const PAGE_SIZE = 10;
const imageCache = new Map();

function parseWasteTypes(wasteStr) {
  if (!wasteStr) return [];
  return wasteStr
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function inspectionToHistory(inspection) {
  const detections = Array.isArray(inspection.detections)
    ? inspection.detections
    : [];
  const detectedCount = detections.reduce(
    (total, item) => total + (Number(item.count) || 0),
    0,
  );
  const statusMap = {
    REVIEW_REQUIRED: STATUS_OPTIONS[0],
    ACTION_REQUIRED: STATUS_OPTIONS[1],
    RESOLVED: STATUS_OPTIONS[2],
  };

  const rawWasteString =
    inspection.wasteSummary || inspection.waste || "탐지 결과 없음";
  const extractedFromText = parseWasteTypes(rawWasteString);

  const wasteTypes = [
    ...new Set([
      ...detections.map((item) => item.className).filter(Boolean),
      ...extractedFromText,
    ]),
  ];

  return {
    id: `INSPECTION-${inspection.id}`,
    inspectionId: inspection.id,
    inspectedAt: inspection.capturedAt,
    location:
      inspection.location && inspection.location !== "미지정 위치"
        ? inspection.location
        : inspection.title,
    locationId: inspection.locationId || inspection.regionId,
    region: inspection.regionName || inspection.location || "기타 지역",
    detectedCount,
    waste: rawWasteString,
    wasteTypes: wasteTypes.length ? wasteTypes : [rawWasteString],
    status:
      statusMap[inspection.status] || inspection.status || STATUS_OPTIONS[0],
  };
}

export default function HistoryList({ searched, onWastesLoaded }) {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState([]);
  const [bulkStatus, setBulkStatus] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    historyService
      .getHistories({ limit: 100 })
      .then((data) => {
        if (cancelled) return;
        const liveHistories = Array.isArray(data)
          ? data.map(inspectionToHistory)
          : [];
        setItems(liveHistories);
      })
      .catch((err) => {
        console.error("점검 이력 DB 조회 실패:", err);
        if (!cancelled) setItems([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const wastes = [
      ...new Set(
        items
          .flatMap((item) => item.wasteTypes || parseWasteTypes(item.waste))
          .filter((name) => name && name !== "탐지 결과 없음"),
      ),
    ].sort();

    if (onWastesLoaded) {
      onWastesLoaded(wastes);
    }
  }, [items, onWastesLoaded]);

  useEffect(() => {
    setPage(1);
    setSelected([]);
  }, [searched]);

  const filteredItems = useMemo(() => {
    if (!searched) return items;

    return items.filter((item) => {
      // 1. 키워드 검색
      const matchesKeyword =
        !searched.keyword ||
        `${item.id} ${item.location}`
          .toLowerCase()
          .includes(searched.keyword.toLowerCase());

      // 2. 지역 검색
      const selectedRegionObj = (searched.regions || []).find(
        (r) => String(r.id) === String(searched.locationId),
      );
      const matchesLocation =
        !searched.locationId ||
        String(item.locationId) === String(searched.locationId) ||
        (selectedRegionObj && item.location?.includes(selectedRegionObj.name));

      // 3. 폐기물 검색
      const targetWaste = (searched.waste || "").trim().toLowerCase();
      const itemWasteList = (item.wasteTypes || []).map((w) =>
        String(w).toLowerCase(),
      );

      const matchesWaste =
        !searched.waste ||
        searched.waste === "전체 폐기물" ||
        itemWasteList.some((w) => w.includes(targetWaste)) ||
        (item.waste && String(item.waste).toLowerCase().includes(targetWaste));

      // 4. 상태 검색
      const matchesStatus =
        !searched.status ||
        searched.status === "전체 상태" ||
        item.status === searched.status;

      // 5. 날짜 검색
      const matchesDate =
        !searched.date || item.inspectedAt?.startsWith(searched.date);

      // 6. 탐지 폐기물 유무 검색 (hasWaste 조건 추가) ★
      const matchesHasWaste = !searched.hasWaste || item.detectedCount > 0;

      return (
        matchesKeyword &&
        matchesLocation &&
        matchesWaste &&
        matchesStatus &&
        matchesDate &&
        matchesHasWaste // ★ 필터링 조건 반영
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
    setItems((current) =>
      current.map((item) =>
        selected.includes(item.id) ? { ...item, status: bulkStatus } : item,
      ),
    );
    setSelected([]);
    setBulkStatus("");
  };

  const deleteSelected = async () => {
    const targets = items.filter(
      (item) => selected.includes(item.id) && item.inspectionId,
    );
    if (!targets.length || deleting) return;
    if (
      !window.confirm(
        `선택한 점검 이력 ${targets.length}건을 삭제하시겠습니까?`,
      )
    )
      return;

    setDeleting(true);
    try {
      await Promise.all(
        targets.map((item) => historyService.deleteHistory(item.inspectionId)),
      );
      const deletedIds = new Set(targets.map((item) => item.id));
      setItems((current) => current.filter((item) => !deletedIds.has(item.id)));
      setSelected((current) => current.filter((id) => !deletedIds.has(id)));
      setPage((current) =>
        Math.min(
          current,
          Math.max(
            1,
            Math.ceil((filteredItems.length - targets.length) / PAGE_SIZE),
          ),
        ),
      );
    } catch (error) {
      window.alert(
        error?.response?.data?.detail ||
          "점검 이력을 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setDeleting(false);
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
            {pagedItems.length ? (
              pagedItems.map((item) => (
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
                  <td>{item.detectedCount}개</td>
                  <td>{item.waste}</td>
                  <td>
                    <span className={`badge ${statusClass(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))
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
            disabled={!selected.length || deleting}
            onClick={deleteSelected}
          >
            {deleting ? "삭제 중..." : "삭제"}
          </button>
          <span className="history-total-count">
            전체 {filteredItems.length}건
          </span>
        </span>
      </nav>
    </article>
  );
}

// 인증 토큰 포함 + 불필요한 더미 이미지 전환을 방지하도록 처리한 썸네일 컴포넌트
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
