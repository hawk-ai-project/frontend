"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/services/authService";
import { getApiErrorMessage } from "@/services/apiClient";
import { validateSignup } from "@/utils/validation";
import { ROUTES } from "@/constants/routes";
import ErrorMessage from "@/components/common/ErrorMessage";

export default function SignupForm() {
  const [form, setForm] = useState({ name: "", email: "", password: "", passwordConfirm: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const field = (name) => (e) => setForm({ ...form, [name]: e.target.value });
  const submit = async (event) => {
    event.preventDefault();
    const validationError = validateSignup(form);
    if (validationError) return setError(validationError);
    setSubmitting(true); setError("");
    try {
      const { passwordConfirm: _passwordConfirm, ...payload } = form;
      await authService.signup({ ...payload, name: payload.name.trim(), email: payload.email.trim() });
      router.replace(`${ROUTES.login}?signup=success`);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "회원가입에 실패했습니다."));
    } finally { setSubmitting(false); }
  };
  return (
    <form className="auth-form" onSubmit={submit}>
      <label>이름<input autoComplete="name" placeholder="이름을 입력해 주세요" value={form.name} onChange={field("name")} required /></label>
      <label>이메일<input type="email" autoComplete="email" placeholder="name@example.com" value={form.email} onChange={field("email")} required /></label>
      <label>비밀번호<input type="password" autoComplete="new-password" placeholder="8자 이상 입력해 주세요" value={form.password} onChange={field("password")} minLength={8} required /></label>
      <label>비밀번호 확인<input type="password" autoComplete="new-password" placeholder="비밀번호를 한 번 더 입력해 주세요" value={form.passwordConfirm} onChange={field("passwordConfirm")} minLength={8} required /></label>
      <ErrorMessage message={error} />
      <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? "가입 중..." : "회원가입"}</button>
      <p>이미 계정이 있으신가요? <Link href={ROUTES.login}>로그인</Link></p>
    </form>
  );
}
