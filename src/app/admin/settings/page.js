export default function AdminSettingsPage() {
  return (
    <div className="admin-page">
      <header className="admin-page-head"><div><span className="admin-kicker">SYSTEM</span><h1>시스템 설정</h1><p>서비스 운영에 필요한 기본 정책을 관리합니다.</p></div></header>
      <section className="admin-panel admin-settings-panel">
        <div className="admin-section-title"><h2>서비스 설정</h2><p>사용자에게 적용되는 공통 기능을 설정합니다.</p></div>
        <label className="admin-setting-row"><span><strong>신규 회원가입 허용</strong><small>사용자가 직접 새로운 계정을 만들 수 있습니다.</small></span><input type="checkbox" defaultChecked /></label>
        <label className="admin-setting-row"><span><strong>게시판 쓰기 허용</strong><small>일반 회원의 게시글 작성을 허용합니다.</small></span><input type="checkbox" defaultChecked /></label>
        <label className="admin-setting-row"><span><strong>점검 완료 알림</strong><small>AI 점검이 완료되면 담당자에게 알림을 보냅니다.</small></span><input type="checkbox" /></label>
      </section>
      <section className="admin-panel admin-settings-panel">
        <div className="admin-section-title"><h2>세션 및 보안</h2><p>로그인 세션의 보안 정책을 설정합니다.</p></div>
        <label className="admin-field"><span>세션 유지 시간</span><select defaultValue="30"><option value="30">30분</option><option value="60">1시간</option><option value="480">8시간</option></select></label>
        <div className="admin-settings-actions"><button type="button" className="admin-primary-btn">변경사항 저장</button></div>
      </section>
    </div>
  );
}
