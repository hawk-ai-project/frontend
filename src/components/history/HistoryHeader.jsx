"use client";

import { useState, useEffect } from "react";
import { STATUS_OPTIONS } from "./historyData";

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getInitialDates = () => {
  const today = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(today.getDate() - 7);

  return {
    startDate: formatDate(weekAgo),
    endDate: formatDate(today),
  };
};

export default function HistoryHeader({
  onSearch,
  regions = [],
  wasteList = [],
  initialValues = {},
}) {
  const defaultDates = getInitialDates();

  const [keyword, setKeyword] = useState(initialValues.keyword || "");
  const [locationId, setLocationId] = useState(initialValues.locationId || "");
  const [waste, setWaste] = useState(initialValues.waste || "전체 폐기물");
  const [status, setStatus] = useState(initialValues.status || "전체 상태");
  const [startDate, setStartDate] = useState(
    initialValues.startDate || defaultDates.startDate,
  );
  const [endDate, setEndDate] = useState(
    initialValues.endDate || defaultDates.endDate,
  );

  useEffect(() => {
    setKeyword(initialValues.keyword || "");
    setLocationId(initialValues.locationId || "");
    setWaste(initialValues.waste || "전체 폐기물");
    setStatus(initialValues.status || "전체 상태");
    setStartDate(initialValues.startDate || defaultDates.startDate);
    setEndDate(initialValues.endDate || defaultDates.endDate);
  }, [
    initialValues.keyword,
    initialValues.locationId,
    initialValues.waste,
    initialValues.status,
    initialValues.startDate,
    initialValues.endDate,
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({
      keyword: keyword.trim(),
      locationId,
      waste,
      status,
      startDate,
      endDate,
    });
  };

  const inputStyle = {
    width: "100%",
    height: "42px",
    borderRadius: "var(--analytics-control-radius, 8px)",
    border: "1px solid #e2e8f0",
    padding: "0 14px",
    fontSize: "14px",
    color: "#1e293b",
    outline: "none",
    boxSizing: "border-box",
    backgroundColor: "#ffffff",
  };

  return (
    <form
      className="card history-filter"
      onSubmit={handleSubmit}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "12px",
        marginBottom: "24px",
        padding: "20px",
        alignItems: "center",
      }}
    >
      {/* 1행 - 1열: 검색어 입력 (2칸) */}
      <div style={{ gridColumn: "span 2" }}>
        <input
          className="input"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="장소 또는 점검번호 검색"
          style={inputStyle}
        />
      </div>

      {/* 1행 - 2열: 전체 지역 (1칸) */}
      <div>
        <select
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
          style={inputStyle}
        >
          <option value="">전체 지역</option>
          {regions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.name}
            </option>
          ))}
        </select>
      </div>

      {/* 1행 - 3열: 전체 폐기물 (1칸) */}
      <div>
        <select
          value={waste}
          onChange={(e) => setWaste(e.target.value)}
          style={inputStyle}
        >
          <option value="전체 폐기물">전체 폐기물</option>
          {wasteList.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {/* 2행 - 1열: 전체 상태 (1칸) */}
      <div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={inputStyle}
        >
          <option value="전체 상태">전체 상태</option>
          {STATUS_OPTIONS.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {/* 2행 - 2열: 날짜 범위 (2칸) */}
      <div
        style={{
          gridColumn: "span 2",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={inputStyle}
        />
        <span style={{ color: "#94a3b8", fontWeight: "bold" }}>~</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={inputStyle}
        />
      </div>

      {/* 2행 - 3열: 검색 버튼 (1칸 우측 정렬) */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          className="btn btn-primary"
          type="submit"
          style={{
            height: "42px",
            padding: "0 28px",
            fontSize: "14px",
            fontWeight: "600",
            whiteSpace: "nowrap",
          }}
        >
          검색
        </button>
      </div>
    </form>
  );
}
