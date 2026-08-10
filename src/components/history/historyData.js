export const inspectionHistories = [
  { id: 'HA-20260805-001', inspectedAt: '2026-08-05T11:30:00', location: '부산 해운대', detectedCount: 20, waste: 'PET Bottle', status: '미처리' },
  { id: 'HA-20260804-004', inspectedAt: '2026-08-04T15:10:00', location: '인천 을왕리', detectedCount: 12, waste: 'Rope', status: '처리 중' },
  { id: 'HA-20260803-002', inspectedAt: '2026-08-03T09:20:00', location: '제주 협재', detectedCount: 8, waste: 'Plastic Buoy', status: '처리 완료' },
  { id: 'HA-20260802-007', inspectedAt: '2026-08-02T17:40:00', location: '강릉 경포', detectedCount: 15, waste: 'Styrofoam', status: '처리 완료' },
  { id: 'HA-20260801-003', inspectedAt: '2026-08-01T10:05:00', location: '부산 다대포', detectedCount: 6, waste: 'Fishing Net', status: '미처리' },
];

export const STATUS_OPTIONS = ['미처리', '처리 중', '처리 완료'];

export function statusClass(status) {
  return status === '미처리' ? 'pending' : status === '처리 중' ? 'progress' : 'done';
}
