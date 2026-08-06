const steps = [
  ['01', '카메라 연결', 'USB 카메라나 기기 카메라를 연결하고 현재 화면을 미리 확인합니다.'],
  ['02', '사진 촬영', '점검이 필요한 시점에 촬영 및 분석 버튼을 눌러 사진 한 장을 캡처합니다.'],
  ['03', 'AI 폐기물 탐지', 'YOLO 모델이 폐기물의 위치와 종류를 탐지하고 분석 이미지를 생성합니다.'],
  ['04', '점검 결과 저장', '탐지 결과와 AI 점검 의견을 확인한 뒤 점검 이력으로 저장합니다.'],
];
export default function ServiceSteps() { return <section className="public-section"><div className="home-section-head"><div><div className="eyebrow">HOW IT WORKS</div><h2>촬영부터 점검 기록까지 한 번에</h2></div></div><div className="grid grid-4">{steps.map(([number,title,text]) => <article className="card service-step" key={number}><div className="step-number">{number}</div><h3>{title}</h3><p>{text}</p></article>)}</div></section>; }
