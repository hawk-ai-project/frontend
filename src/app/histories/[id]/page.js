import Link from "next/link";
import { notFound } from "next/navigation";
import {
  inspectionHistories,
  statusClass,
} from "@/components/history/historyData";

const details = {
  "HA-20260805-001": {
    inspector: "김도하",
    fullLocation: "부산 해운대 해수욕장 동측",
    detections: [
      ["PET Bottle", 12],
      ["Rope", 5],
      ["Plastic Buoy", 3],
    ],
    opinion:
      "PET병이 다수 탐지되었으며 로프와 플라스틱 부표가 함께 확인되었습니다. 해안선 인근의 오염도가 높은 편으로 판단되므로 우선 수거 작업을 권장합니다.",
  },
};

const formatDateTime = (value) =>
  new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
    hour12: false,
  }).format(new Date(value));

export default async function HistoryDetailPage({ params }) {
  const { id } = await params;
  const history = inspectionHistories.find((item) => item.id === id);
  if (!history) notFound();
  const detail = details[id] || {
    inspector: "현장 점검자",
    fullLocation: history.location,
    detections: [[history.waste, history.detectedCount]],
    opinion:
      "탐지 결과를 확인하고 현장 상황에 맞는 수거 및 후속 조치를 진행해 주세요.",
  };
  return (
    <div className="page-shell">
      <div className="page-head">
        <div>
          <div className="eyebrow">Inspection Detail</div>
          <h1>점검 상세 #{history.id}</h1>
          <p className="subtitle">점검 결과와 처리 이력을 확인합니다.</p>
        </div>
        <Link className="btn btn-secondary" href="/histories">
          목록으로
        </Link>
      </div>
      <article className="card card-pad">
        <div className="history-result-images">
          <div>
            <p className="history-image-label">원본 이미지</p>
            <div className="history-result-image" />
          </div>
          <div>
            <p className="history-image-label">분석 이미지</p>
            <div className="history-result-image analyzed">
              <span className="detection-box">{history.waste} 0.92</span>
            </div>
          </div>
        </div>
      </article>
      <div className="grid grid-2 section-gap">
        <article className="card card-pad">
          <h2 className="section-title">기본 정보</h2>
          <div className="history-meta-grid">
            <Meta
              label="점검 일시"
              value={formatDateTime(history.inspectedAt)}
            />
            <Meta label="점검자" value={detail.inspector} />
            <Meta label="점검 장소" value={detail.fullLocation} />
            <Meta
              label="처리 상태"
              value={
                <span className={`badge ${statusClass(history.status)}`}>
                  {history.status}
                </span>
              }
            />
          </div>
        </article>
        <article className="card card-pad">
          <h2 className="section-title">탐지 결과</h2>
          <div className="history-detection-list">
            {detail.detections.map(([name, count]) => (
              <div className="history-detection-row" key={name}>
                <span>{name}</span>
                <b>{count}개</b>
              </div>
            ))}
          </div>
        </article>
      </div>
      <article className="card card-pad section-gap">
        <h2 className="section-title">점검 의견</h2>
        <p className="history-opinion">{detail.opinion}</p>
      </article>
      <article className="card card-pad section-gap">
        <h2 className="section-title">처리 이력</h2>
        <div className="grid grid-3">
          <Meta
            label={formatDateTime(history.inspectedAt)}
            value="AI 점검 결과 저장"
          />
          <Meta label="현재 상태" value={history.status} />
          <Meta
            label="다음 단계"
            value={
              history.status === "처리 완료"
                ? "처리 완료"
                : "수거 담당자 배정 필요"
            }
          />
        </div>
      </article>
    </div>
  );
}

function Meta({ label, value }) {
  return (
    <div className="history-meta-item">
      <div className="history-meta-label">{label}</div>
      <div className="history-meta-value">{value}</div>
    </div>
  );
}
