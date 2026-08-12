'use client';

import { useState, useEffect } from 'react';

export default function AnalyticsHeader({
  startDate,
  endDate,
  locationId,
  setStartDate,
  setEndDate,
  setLocationId,
  onSearch,
  onExport,
}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize(); // 초기 화면 실행
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ width: '100%', marginBottom: '24px' }}>
      {/* 1. 상단 타이틀 & 보고서 내보내기 버튼 */}
      <div
        className="page-head"
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'flex-start',
          gap: '16px',
        }}
      >
        <div>
          <div className="eyebrow">ANALYTICS</div>
          <h1>통계 분석</h1>
          <p className="subtitle">
            기간과 장소를 기준으로 점검 및 폐기물 탐지 추이를 분석합니다.
          </p>
        </div>

        <button
          type="button"
          onClick={onExport}
          style={{
            backgroundColor: '#ffffff',
            color: '#1e293b',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            whiteSpace: 'nowrap',
            width: isMobile ? '100%' : 'auto',
          }}
        >
          보고서 내보내기
        </button>
      </div>

      {/* 2. 하단: 필터 검색 영역 (모바일 반응형 적용) */}
      <form
        onSubmit={onSearch}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '12px',
          alignItems: 'center',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
          border: '1px solid #f1f5f9',
          width: '100%',
          boxSizing: 'border-box',
          marginTop: '20px',
        }}
      >
        <div style={{ flex: '1', width: '100%' }}>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{
              width: '100%',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '10px 14px',
              fontSize: '14px',
              color: '#1e293b',
              backgroundColor: '#ffffff',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
        <div style={{ flex: '1', width: '100%' }}>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{
              width: '100%',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '10px 14px',
              fontSize: '14px',
              color: '#1e293b',
              backgroundColor: '#ffffff',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
        <div style={{ flex: '1', width: '100%' }}>
          <select
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            style={{
              width: '100%',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '10px 14px',
              fontSize: '14px',
              color: '#1e293b',
              backgroundColor: '#ffffff',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          >
            <option value="">전체 장소</option>
          </select>
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          style={{
            padding: '10px 24px',
            fontSize: '14px',
            fontWeight: '600',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            width: isMobile ? '100%' : 'auto',
          }}
        >
          조회
        </button>
      </form>
    </div>
  );
}