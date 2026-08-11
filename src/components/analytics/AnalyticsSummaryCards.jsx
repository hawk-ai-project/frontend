'use client';

export default function AnalyticsSummaryCards({ summary }) {
  if (!summary) return null;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '24px',
      }}
    >
      {/* 카드 1: 기간 내 점검 */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '24px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
          border: '1px solid #f1f5f9',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#e0f2fe',
            opacity: 0.6,
            pointerEvents: 'none',
          }}
        />
        <p style={{ color: '#475569', fontSize: '14px', fontWeight: '600', margin: '0 0 16px 0' }}>
          기간 내 점검
        </p>
        <h3 style={{ color: '#0f172a', fontSize: '32px', fontWeight: '800', margin: '0 0 12px 0', lineHeight: 1 }}>
          {summary.totalInspections || 0}<span style={{ fontSize: '24px', fontWeight: '700' }}>건</span>
        </h3>
        <p style={{ color: '#059669', fontSize: '13px', fontWeight: '600', margin: 0 }}>
          일평균 {summary.dailyAvgInspections || 0}건
        </p>
      </div>

      {/* 카드 2: 탐지 폐기물 */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '24px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
          border: '1px solid #f1f5f9',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#e0f2fe',
            opacity: 0.6,
            pointerEvents: 'none',
          }}
        />
        <p style={{ color: '#475569', fontSize: '14px', fontWeight: '600', margin: '0 0 16px 0' }}>
          탐지 폐기물
        </p>
        <h3 style={{ color: '#0f172a', fontSize: '32px', fontWeight: '800', margin: '0 0 12px 0', lineHeight: 1 }}>
          {summary.totalDetections || 0}<span style={{ fontSize: '24px', fontWeight: '700' }}>개</span>
        </h3>
        <p style={{ color: '#059669', fontSize: '13px', fontWeight: '600', margin: 0 }}>
          전주 대비 +7.5%
        </p>
      </div>

      {/* 카드 3: 최다 탐지 */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '24px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
          border: '1px solid #f1f5f9',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#e0f2fe',
            opacity: 0.6,
            pointerEvents: 'none',
          }}
        />
        <p style={{ color: '#475569', fontSize: '14px', fontWeight: '600', margin: '0 0 16px 0' }}>
          최다 탐지
        </p>
        <h3
          style={{
            color: '#0f172a',
            fontSize: '28px',
            fontWeight: '800',
            margin: '0 0 12px 0',
            lineHeight: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {summary.topDetectedItem?.name || '-'}
        </h3>
        <p style={{ color: '#059669', fontSize: '13px', fontWeight: '600', margin: 0 }}>
          {summary.topDetectedItem?.count || 0}개 · {summary.topDetectedItem?.ratio || 0}%
        </p>
      </div>

      {/* 카드 4: 처리 완료율 */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '24px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
          border: '1px solid #f1f5f9',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#e0f2fe',
            opacity: 0.6,
            pointerEvents: 'none',
          }}
        />
        <p style={{ color: '#475569', fontSize: '14px', fontWeight: '600', margin: '0 0 16px 0' }}>
          처리 완료율
        </p>
        <h3 style={{ color: '#0f172a', fontSize: '32px', fontWeight: '800', margin: '0 0 12px 0', lineHeight: 1 }}>
          {summary.resolutionRate || 0}%
        </h3>
        <p style={{ color: '#059669', fontSize: '13px', fontWeight: '600', margin: 0 }}>
          {summary.resolvedCount || 0} / {summary.totalInspections || 0}건
        </p>
      </div>
    </div>
  );
}