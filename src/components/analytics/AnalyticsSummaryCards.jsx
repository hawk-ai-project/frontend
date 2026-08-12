'use client';

import { useState, useEffect } from 'react';

export default function AnalyticsSummaryCards({ summary }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize(); // 초기 상태 설정
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!summary) return null;

  // 카드 공통 스타일 (모바일 여부에 따라 패딩 및 너비 자동 조절)
  const cardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    padding: isMobile ? '16px' : '24px',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
    border: '1px solid #f1f5f9',
    minWidth: 0, // Grid 내부 텍스트 초과로 인한 레이아웃 깨짐 방지
  };

  const titleStyle = {
    color: '#475569',
    fontSize: isMobile ? '13px' : '14px',
    fontWeight: '600',
    margin: '0 0 12px 0',
  };

  const valueStyle = {
    color: '#0f172a',
    fontSize: isMobile ? '22px' : '32px',
    fontWeight: '800',
    margin: '0 0 8px 0',
    lineHeight: 1,
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', // 모바일: 2행 2열(2x2), PC: 1행 4열
        gap: isMobile ? '12px' : '16px',
        marginBottom: '24px',
      }}
    >
      {/* 카드 1: 기간 내 점검 */}
      <div style={cardStyle}>
        <div
          style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: isMobile ? '60px' : '80px',
            height: isMobile ? '60px' : '80px',
            borderRadius: '50%',
            backgroundColor: '#e0f2fe',
            opacity: 0.6,
            pointerEvents: 'none',
          }}
        />
        <p style={titleStyle}>기간 내 점검</p>
        <h3 style={valueStyle}>
          {summary.totalInspections || 0}
          <span style={{ fontSize: isMobile ? '16px' : '24px', fontWeight: '700' }}>건</span>
        </h3>
        <p style={{ color: '#059669', fontSize: isMobile ? '11px' : '13px', fontWeight: '600', margin: 0 }}>
          일평균 {summary.dailyAvgInspections || 0}건
        </p>
      </div>

      {/* 카드 2: 탐지 폐기물 */}
      <div style={cardStyle}>
        <div
          style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: isMobile ? '60px' : '80px',
            height: isMobile ? '60px' : '80px',
            borderRadius: '50%',
            backgroundColor: '#e0f2fe',
            opacity: 0.6,
            pointerEvents: 'none',
          }}
        />
        <p style={titleStyle}>탐지 폐기물</p>
        <h3 style={valueStyle}>
          {summary.totalDetections || 0}
          <span style={{ fontSize: isMobile ? '16px' : '24px', fontWeight: '700' }}>개</span>
        </h3>
        <p style={{ color: '#059669', fontSize: isMobile ? '11px' : '13px', fontWeight: '600', margin: 0 }}>
          전주 대비 +7.5%
        </p>
      </div>

      {/* 카드 3: 최다 탐지 */}
      <div style={cardStyle}>
        <div
          style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: isMobile ? '60px' : '80px',
            height: isMobile ? '60px' : '80px',
            borderRadius: '50%',
            backgroundColor: '#e0f2fe',
            opacity: 0.6,
            pointerEvents: 'none',
          }}
        />
        <p style={titleStyle}>최다 탐지</p>
        <h3
          style={{
            ...valueStyle,
            fontSize: isMobile ? '18px' : '28px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {summary.topDetectedItem?.name || '-'}
        </h3>
        <p style={{ color: '#059669', fontSize: isMobile ? '11px' : '13px', fontWeight: '600', margin: 0 }}>
          {summary.topDetectedItem?.count || 0}개 · {summary.topDetectedItem?.ratio || 0}%
        </p>
      </div>

      {/* 카드 4: 처리 완료율 */}
      <div style={cardStyle}>
        <div
          style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: isMobile ? '60px' : '80px',
            height: isMobile ? '60px' : '80px',
            borderRadius: '50%',
            backgroundColor: '#e0f2fe',
            opacity: 0.6,
            pointerEvents: 'none',
          }}
        />
        <p style={titleStyle}>처리 완료율</p>
        <h3 style={valueStyle}>{summary.resolutionRate || 0}%</h3>
        <p style={{ color: '#059669', fontSize: isMobile ? '11px' : '13px', fontWeight: '600', margin: 0 }}>
          {summary.resolvedCount || 0} / {summary.totalInspections || 0}건
        </p>
      </div>
    </div>
  );
}