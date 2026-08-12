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
    event.preventDefault();
    if (submitting) return;
    setError("");
    setSubmitting(true);
    try {
      await login({ email: form.email.trim().toLowerCase(), password: form.password });
      router.replace(ROUTES.home);
      router.refresh();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "이메일 또는 비밀번호를 확인해 주세요."));
    } finally {
      setSubmitting(false);
    }
  };

  return <form className="auth-form" onSubmit={submit} noValidate>
    <label htmlFor="login-email">이메일<input id="login-email" name="email" type="email" inputMode="email" autoComplete="username" autoCapitalize="none" autoCorrect="off" spellCheck={false} placeholder="name@example.com" required value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} /></label>
    <label htmlFor="login-password">비밀번호<input id="login-password" name="password" type="password" autoComplete="current-password" placeholder="비밀번호를 입력해 주세요" required value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} /></label>
    <ErrorMessage message={error} />
    <button type="submit" className="btn btn-primary" disabled={submitting || !form.email.trim() || !form.password}>{submitting ? "로그인 중..." : "로그인"}</button>
    <p>계정이 없으신가요? <Link href={ROUTES.signup}>회원가입</Link></p>
  </form>;
}
