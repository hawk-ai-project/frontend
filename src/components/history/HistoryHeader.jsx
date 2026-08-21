"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { STATUS_OPTIONS } from "./historyData";
import { analyticsService } from "@/services/analyticsService";

function normalizeSearchDate(value) {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";

  const digits = trimmed.replace(/\D/g, "");

  let year = "",
    month = "",
    day = "";

  if (digits.length === 8) {
    year = digits.substring(0, 4);
    month = digits.substring(4, 6);
    day = digits.substring(6, 8);
  } else if (digits.length === 6) {
    year = digits.substring(0, 4);
    month = digits.substring(4, 5).padStart(2, "0");
    day = digits.substring(5, 6).padStart(2, "0");
  } else if (digits.length === 7) {
    year = digits.substring(0, 4);
    const rest = digits.substring(4);
    if (rest.startsWith("0")) {
      month = rest.substring(0, 2);
      day = rest.substring(2).padStart(2, "0");
    } else {
      month = rest.substring(0, 1).padStart(2, "0");
      day = rest.substring(1).padStart(2, "0");
    }
  } else {
    const parts = trimmed.match(/\d+/g);
    if (!parts || parts[0].length !== 4) return trimmed;
    year = parts[0];
    if (parts.length >= 2) month = parts[1].padStart(2, "0");
    if (parts.length >= 3) day = parts[2].padStart(2, "0");
  }

  if (year && month && day) return `${year}-${month}-${day}`;
  if (year && month) return `${year}-${month}`;
  if (year) return year;

  return trimmed;
}

function formatInputDisplayDate(value) {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}.${digits.slice(4)}`;
  return `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6, 8)}`;
}

export default function HistoryHeader({ onSearch, wastes = [] }) {
  const searchParams = useSearchParams();

  const [regions, setRegions] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [locationId, setLocationId] = useState("");
  const [waste, setWaste] = useState("전체 폐기물");
  const [status, setStatus] = useState("전체 상태");
  const [date, setDate] = useState("");

  const hiddenDateInputRef = useRef(null);

  // 1. 지역 목록 최초 조회
  useEffect(() => {
    let cancelled = false;
    analyticsService
      .getRegions()
      .then((regionList) => {
        if (!cancelled && Array.isArray(regionList)) {
          setRegions(regionList);
        }
      })
      .catch((err) => console.error("지역 목록 오류:", err));

    return () => {
      cancelled = true;
    };
  }, []);

  // 2. URL 파라미터 직접 파싱 및 State/조회 동기화
  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);
    const pDate =
      urlParams.get("date") ||
      urlParams.get("startDate") ||
      searchParams?.get("date") ||
      "";
    const pWaste =
      urlParams.get("waste") ||
      urlParams.get("wasteType") ||
      searchParams?.get("waste") ||
      "전체 폐기물";
    const pLocationId =
      urlParams.get("locationId") || searchParams?.get("locationId") || "";
    const pHasWaste = urlParams.get("hasWaste") === "true";

    if (pDate) setDate(pDate);
    if (pWaste) setWaste(pWaste);
    if (pLocationId) setLocationId(pLocationId);

    if (pDate || pWaste !== "전체 폐기물" || pLocationId || pHasWaste) {
      onSearch({
        keyword: "",
        locationId: pLocationId,
        waste: pWaste,
        status: "전체 상태",
        date: normalizeSearchDate(pDate),
        hasWaste: pHasWaste,
        regions, // regions 데이터가 준비된 시점에 전달됨
      });
    }
  }, [searchParams?.toString(), regions]);

  const search = (event) => {
    if (event) event.preventDefault();
    const normalizedDate = normalizeSearchDate(date);

    if (normalizedDate && normalizedDate.includes("-")) {
      setDate(normalizedDate.replace(/-/g, "."));
    }

    onSearch({
      keyword: keyword.trim(),
      locationId,
      waste,
      status,
      date: normalizedDate,
      regions,
    });
  };

  const handleDateChange = (e) => {
    setDate(formatInputDisplayDate(e.target.value));
  };

  const handleDateBlur = () => {
    const normalized = normalizeSearchDate(date);
    if (normalized && normalized.includes("-")) {
      setDate(normalized.replace(/-/g, "."));
    }
  };

  const openCalendarPicker = () => {
    if (hiddenDateInputRef.current) {
      if (typeof hiddenDateInputRef.current.showPicker === "function") {
        hiddenDateInputRef.current.showPicker();
      } else {
        hiddenDateInputRef.current.focus();
      }
    }
  };

  const handleCalendarSelect = (e) => {
    const selectedVal = e.target.value;
    if (selectedVal) {
      setDate(selectedVal.replace(/-/g, "."));
    }
  };

  return (
    <form className="card history-filter" onSubmit={search}>
      <select
        value={locationId}
        onChange={(e) => setLocationId(e.target.value)}
        aria-label="지역 선택"
      >
        <option value="">전체 지역</option>
        {regions.map((region) => (
          <option key={region.id} value={region.id}>
            {region.name}
          </option>
        ))}
      </select>
      <input
        className="input"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="장소 또는 점검번호 검색"
      />
      <select
        value={waste}
        onChange={(e) => setWaste(e.target.value)}
        aria-label="폐기물 종류"
      >
        <option>전체 폐기물</option>
        {wastes.map((name) => (
          <option key={name}>{name}</option>
        ))}
      </select>
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option>전체 상태</option>
        {STATUS_OPTIONS.map((name) => (
          <option key={name}>{name}</option>
        ))}
      </select>

      <div style={{ position: "relative", display: "inline-block" }}>
        <input
          className="input"
          type="text"
          value={date}
          onChange={handleDateChange}
          onBlur={handleDateBlur}
          placeholder="YYYY.MM.DD"
          aria-label="점검 날짜"
          style={{ paddingRight: "36px" }}
        />
        <button
          type="button"
          onClick={openCalendarPicker}
          style={{
            position: "absolute",
            right: "8px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            color: "#64748b",
          }}
          title="달력에서 선택"
        >
          📅
        </button>
        <input
          ref={hiddenDateInputRef}
          type="date"
          onChange={handleCalendarSelect}
          style={{
            position: "absolute",
            opacity: 0,
            width: 0,
            height: 0,
            pointerEvents: "none",
            bottom: 0,
            left: 0,
          }}
        />
      </div>

      <button className="btn btn-primary" type="submit">
        검색
      </button>
    </form>
  );
}
