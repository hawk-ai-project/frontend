'use client';

export default function AnalyticsInsights({ insights }) {
  const title = insights?.title || '부산 해운대 점검 구역에서 PET병 비율이 가장 높게 나타났습니다.';
  const description =
    insights?.description ||
    '최근 5일간 PET병 탐지량은 전체의 38%를 차지했으며, 방파제 인근 점검 건에서 집중적으로 확인되었습니다. 해당 구역의 수거 우선순위를 높이는 것이 권장됩니다.';

  return (
    <div className="card card-pad">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <span className="badge progress">AI INSIGHT</span>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>AI 분석 인사이트</h2>
      </div>
      <div style={{ background: 'var(--bg-sub, #f8fafc)', padding: '16px', borderRadius: '12px' }}>
        <p style={{ fontWeight: '600', color: 'var(--text-1, #0f172a)', marginBottom: '6px' }}>{title}</p>
        <p className="subtext" style={{ lineHeight: '1.6' }}>{description}</p>
      </div>
    </div>
  );
}