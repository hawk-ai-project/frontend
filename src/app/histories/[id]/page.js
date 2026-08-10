import { notFound } from 'next/navigation';
import HistoryDetailClient from '@/components/history/HistoryDetailClient';
import { inspectionHistories } from '@/components/history/historyData';

const details = {
  'HA-20260807-001': { inspector: '김도하', fullLocation: '부산 해운대 해수욕장 동측', coordinates: '35.1587,129.1604', detections: [['PET Bottle', 12], ['Rope', 5], ['Plastic Buoy', 3]], opinion: 'PET병과 로프, 플라스틱 부표가 다수 확인되었습니다. 해안선 인근을 우선 수거하고, 조치 후 증빙 사진을 등록해 주세요.' },
  'HA-20260804-004': { inspector: '이일권', fullLocation: '인천 을왕리 해수욕장 북측', coordinates: '37.4486,126.3720', detections: [['Styrofoam', 1], ['Slipper', 1], ['Plastic Bag', 1], ['PET Bottle', 1]], opinion: '분석 이미지에서 스티로폼, 슬리퍼, 비닐봉지, 페트병이 각각 탐지되었습니다. 현장 수거 후 증빙 사진을 등록해 주세요.' },
};
export default async function Page({ params }) { const { id } = await params; const history = inspectionHistories.find((item) => item.id === id); if (!history) notFound(); const detail = details[id] || { inspector: '현장 점검자', fullLocation: history.location, coordinates: '33.4507,126.5707', detections: [[history.waste, history.detectedCount]], opinion: '탐지 결과를 확인하고 현장 상황에 맞는 수거 및 후속 조치를 작성해 주세요.' }; return <HistoryDetailClient history={history} detail={detail} />; }
