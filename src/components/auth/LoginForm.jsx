"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { getApiErrorMessage } from "@/services/apiClient";
import { ROUTES } from "@/constants/routes";
import ErrorMessage from "@/components/common/ErrorMessage";

const SAVED_EMAIL_KEY = "hawk-ai.saved-login-email";

export default function LoginForm() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [saveEmail, setSaveEmail] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    try {
      const savedEmail = window.localStorage.getItem(SAVED_EMAIL_KEY);
      if (savedEmail) {
        // This one-time effect restores state from the browser storage.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setForm((current) => ({ ...current, email: savedEmail }));
        setSaveEmail(true);
      }
    } catch {
      // The login form remains usable when browser storage is unavailable.
    }
  }, []);

  const submit = async (event) => {
    event.preventDefault(); setError(""); setSubmitting(true);
    try {
      const email = form.email.trim();
      await login({ email, password: form.password });
      try {
        if (saveEmail) window.localStorage.setItem(SAVED_EMAIL_KEY, email);
        else window.localStorage.removeItem(SAVED_EMAIL_KEY);
      } catch {
        // A storage failure should not turn a successful login into an error.
      }
      router.replace(ROUTES.home);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "로그인에 실패했습니다."));
    } finally { setSubmitting(false); }
  };
  return (
    <form className="auth-form" onSubmit={submit}>
      <label>이메일<input type="email" autoComplete="email" placeholder="name@example.com" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
      <label>비밀번호<input type="password" autoComplete="current-password" placeholder="비밀번호를 입력해 주세요" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
      <label className="auth-save-email">
        <input type="checkbox" checked={saveEmail} onChange={(event) => setSaveEmail(event.target.checked)} />
        <span>아이디 저장</span>
      </label>
      <ErrorMessage message={error} />
      <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? "로그인 중..." : "로그인"}</button>
      <p>계정이 없으신가요? <Link href={ROUTES.signup}>회원가입</Link></p>
    </form>
  );
}
