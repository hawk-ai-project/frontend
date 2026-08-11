'use client';

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
  return (
    <div style={{ width: '100%', marginBottom: '24px' }}>
      {/* 현장점검과 동일한 page-head 헤더 구조 */}
      <div className="page-head">
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
          }}
        >
          보고서 내보내기
        </button>
      </div>

      {/* 하단: 필터 검색 영역 (독립 카드) */}
      <form
        onSubmit={onSearch}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '16px 20px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
          border: '1px solid #f1f5f9',
          width: '100%',
          boxSizing: 'border-box',
          marginTop: '20px',
        }}
      >
        <div style={{ flex: '1' }}>
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
        <div style={{ flex: '1' }}>
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
        <div style={{ flex: '1' }}>
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
          }}
        >
          조회
        </button>
      </form>
    </div>
  );
}