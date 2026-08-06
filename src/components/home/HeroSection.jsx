import Link from 'next/link';
import Image from 'next/image';
import { ROUTES } from '@/constants/routes';

export default function HeroSection() {
  return (
    <section className="home-hero">
      <div className="hero-copy">
        <div className="eyebrow">AI COASTAL INSPECTION</div>
        <h1>매의 눈처럼 정확하게,<br />해안 폐기물을 점검합니다.</h1>
        <p className="subtitle">Hawk-AI는 해안이나 수면 주변에서 촬영한 사진 한 장을 AI로 분석하여 폐기물 종류와 개수를 확인하고, 점검 결과를 체계적으로 기록할 수 있도록 돕는 현장 점검 서비스입니다.</p>
        <div className="hero-actions"><Link className="btn btn-primary" href={ROUTES.inspection}>현장점검 시작</Link><Link className="btn btn-secondary" href={ROUTES.histories}>점검이력 보기</Link></div>
        <div className="hero-tags"><span>사진 1장 분석</span><span>YOLO 객체 탐지</span><span>LLM 점검 의견</span><span>점검 이력 관리</span></div>
      </div>
      <div className="hero-preview card">
        <div className="hero-preview-top"><span className="badge done">AI 분석 예시</span><strong>해안 폐기물 탐지</strong></div>
        <div className="hero-preview-image"><Image src="/images/home/main-analysis.png" alt="해안 폐기물 AI 분석 예시" fill sizes="(max-width: 1050px) 100vw, 520px" /></div>
        <div className="hero-preview-bottom"><div><small>탐지 객체</small><b>폐기물 종류</b></div><div><small>분석 결과</small><b>종류·개수 확인</b></div><div><small>기록 방식</small><b>점검이력 저장</b></div></div>
      </div>
    </section>
  );
}
