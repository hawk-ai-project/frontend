import Image from 'next/image';

const features = [
  ['◎', '폐기물 객체 탐지', 'PET병, 로프, 부표, 스티로폼 등 해안 폐기물을 자동으로 탐지합니다.'],
  ['AI', 'AI 점검 의견 생성', '탐지 결과를 바탕으로 오염 상태와 권장 조치 의견을 자동 작성합니다.'],
  ['✓', '점검 이력 관리', '점검 일시, 장소, 이미지, 탐지 결과, 처리 상태를 체계적으로 관리합니다.'],
];

export default function CoreFeatures() {
  return (
    <section className="public-section feature-section">
      <div className="feature-copy">
        <div className="eyebrow">CORE FEATURES</div>
        <h2>현장 점검에 필요한 핵심 기능</h2>
        <p className="subtitle">실시간 영상을 지속적으로 감시하는 모니터링 서비스가 아니라, 사용자가 필요한 시점에 직접 촬영하고 결과를 기록하는 점검 중심 서비스입니다.</p>
        <div className="feature-list">
          {features.map(([icon, title, text]) => <div className="feature-item" key={title}><div className="feature-icon">{icon}</div><div><h3>{title}</h3><p>{text}</p></div></div>)}
        </div>
      </div>
      <div className="card feature-preview">
        <div className="mini-window-head"><span /><span /><span /></div>
        <div className="mini-window-body">
          <div className="mini-image"><Image src="/images/home/pet-bottles.png" alt="페트병 폐기물 AI 탐지 예시" fill sizes="(max-width: 1050px) 100vw, 520px" /></div>
          <div className="mini-results"><div><span>PET Bottle</span><b>12개</b></div><div><span>Rope</span><b>5개</b></div><div><span>Plastic Buoy</span><b>3개</b></div></div>
          <div className="mini-comment">PET병이 다수 탐지되었습니다. 우선적인 수거 작업을 권장합니다.</div>
        </div>
      </div>
    </section>
  );
}
