import SignupForm from "@/components/auth/SignupForm";
export const metadata = { title: "회원가입" };
export default function SignupPage() {
  return <section className="auth-page"><div className="auth-card"><span className="eyebrow">GET STARTED</span><h1>회원가입</h1><p>현장 관리 전용 계정을 만들어 보세요.</p><SignupForm /></div></section>;
}
