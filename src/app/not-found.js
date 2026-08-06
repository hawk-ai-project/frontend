import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="not-found-shell">
      <section className="not-found-card" aria-labelledby="not-found-title">
        <div className="not-found-icon" aria-hidden="true">◇</div>
        <p className="eyebrow">PAGE NOT AVAILABLE</p>
        <h1 id="not-found-title">아직 준비 중인 기능입니다.</h1>
        <p className="not-found-description">
          요청하신 화면은 현재 서비스에 포함되지 않았거나 개발 중입니다.<br />
          이용 가능한 메뉴로 이동해 주세요.
        </p>
        <div className="not-found-actions">
          <Link className="btn btn-primary" href="/">HOME으로 이동</Link>
          <Link className="btn btn-secondary" href="/boards">게시판 보기</Link>
        </div>
        <p className="not-found-help">입력한 주소가 정확한지 다시 확인해 주세요.</p>
      </section>
    </div>
  );
}
