import LoginForm from "@/components/auth/LoginForm";
export const metadata = { title: "로그인" };
export default function LoginPage() {
  return <section className="auth-page"><div className="auth-card"><span className="eyebrow">WELCOME BACK</span><h1>로그인</h1><p>Hawk-AI 서비스를 계속 이용해 보세요.</p><LoginForm /></div></section>;
}
