"use client";

import { useState } from "react";
import HistoryHeader from "./HistoryHeader";
import HistoryList from "./HistoryList";

export default function HistoryClient() {
  const [searched, setSearched] = useState(null);
  const [wastes, setWastes] = useState([]);

  return (
    <div className="page-shell">
      <div style={{ width: "100%", marginBottom: "24px" }}>
        <div className="page-head" style={{ marginBottom: "8px" }}>
          <div>
            <div className="eyebrow">HISTORY</div>
            <h1>점검 이력 조회</h1>
          </div>
        </div>
        <p className="subtitle" style={{ margin: 0 }}>
          수집된 점검 결과 및 폐기물 탐지 목록을 검색하고 상태를 변경할 수
          있습니다.
        </p>
      </div>

      {/* 검색 헤더와 리스트 컴포넌트 연결 */}
      <HistoryHeader onSearch={setSearched} wastes={wastes} />
      <HistoryList searched={searched} onWastesLoaded={setWastes} />
    </div>
  );
}
