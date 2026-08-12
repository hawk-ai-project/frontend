"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { getApiErrorMessage } from "@/services/apiClient";
import { ROUTES } from "@/constants/routes";
import ErrorMessage from "@/components/common/ErrorMessage";

export default function LoginForm() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const submit = async (event) => {
    event.preventDefault(); setError(""); setSubmitting(true);
    try {
      await login({ email: form.email.trim(), password: form.password });
      router.replace(ROUTES.home);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "로그인에 실패했습니다."));
    } finally { setSubmitting(false); }
  };
  return (
    <form className="auth-form" onSubmit={submit}>
      <label>이메일<input type="email" autoComplete="email" placeholder="name@example.com" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
      <label>비밀번호<input type="password" autoComplete="current-password" placeholder="비밀번호를 입력해 주세요" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
      <ErrorMessage message={error} />
      <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? "로그인 중..." : "로그인"}</button>
      <p>계정이 없으신가요? <Link href={ROUTES.signup}>회원가입</Link></p>
    </form>
  );
}
