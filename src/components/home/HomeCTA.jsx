import Link from 'next/link';
export default function HomeCTA() { return <section className="public-section public-cta card"><div><div className="eyebrow">START INSPECTION</div><h2>해안 환경 점검을 시작하세요.</h2><p>카메라로 촬영한 한 장의 사진으로 폐기물을 탐지하고 점검 기록을 남길 수 있습니다.</p></div><Link className="btn btn-primary" href="/inspection">현장점검 시작</Link></section>; }
