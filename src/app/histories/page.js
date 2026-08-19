"use client";

import { useState } from "react";
import Link from "next/link";
import HistoryHeader from "@/components/history/HistoryHeader";
import HistoryList from "@/components/history/HistoryList";
import { ROUTES } from "@/constants/routes";

export default function HistoriesPage() {
  // 초기 검색 조건 객체로 설정
  const [searched, setSearched] = useState({
    keyword: "",
    locationId: "",
    waste: "전체 폐기물",
    status: "전체 상태",
    date: "",
  });
  const [wastes, setWastes] = useState([]);

  return (
    <div className="page-shell history-page">
      <div className="page-head">
        <div>
          <div className="eyebrow">History</div>
          <h1>점검 이력</h1>
          <p className="subtitle">
            저장된 점검 기록을 조건별로 검색하고 처리 상태를 확인합니다.
          </p>
        </div>
        <Link className="btn btn-primary" href={ROUTES.inspection}>
          + 새 점검
        </Link>
      </div>

      <HistoryHeader onSearch={setSearched} wastes={wastes} />
      <HistoryList searched={searched} onWastesLoaded={setWastes} />
    </div>
  );
}
