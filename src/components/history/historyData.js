export const inspectionHistories = [
  { id: 'HA-20260807-001', inspectedAt: '2026-08-07T18:00:00', location: '부산 해운대', detectedCount: 20, waste: 'PET Bottle', status: '대기' },
  { id: 'HA-20260804-004', inspectedAt: '2026-08-04T15:10:00', location: '인천 을왕리', detectedCount: 4, waste: 'Mixed Waste', status: '진행' },
  { id: 'HA-20260803-002', inspectedAt: '2026-08-03T09:20:00', location: '제주 협재', detectedCount: 8, waste: 'Plastic Buoy', status: '완료' },
  { id: 'HA-20260802-007', inspectedAt: '2026-08-02T17:40:00', location: '강릉 경포', detectedCount: 15, waste: 'Styrofoam', status: '완료' },
  { id: 'HA-20260801-003', inspectedAt: '2026-08-01T10:05:00', location: '부산 다대포', detectedCount: 6, waste: 'Fishing Net', status: '대기' },
];

export const STATUS_OPTIONS = ['대기', '진행', '완료'];

export function statusClass(status) {
  return status === '대기' ? 'pending' : status === '진행' ? 'progress' : 'done';
}
