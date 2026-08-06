import SignupForm from "@/components/auth/SignupForm";
export const metadata = { title: "회원가입" };
export default function SignupPage() {
  return (
    <section className="auth-page">
      <div className="auth-card">
        <span className="eyebrow">GET STARTED</span>
        <h1>회원가입</h1>
        <p>팀의 현장 점검 계정을 만드세요.</p>
        <SignupForm />
      </div>
    </section>
  );
}
