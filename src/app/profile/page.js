"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getApiErrorMessage } from "@/services/apiClient";
import { ROUTES } from "@/constants/routes";
import ErrorMessage from "@/components/common/ErrorMessage";
import styles from "./profile.module.css";

function ProfileForm({ initialUser, updateProfile }) {
  const [form, setForm] = useState({ name: initialUser.name, email: initialUser.email, currentPassword: "", newPassword: "", newPasswordConfirm: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const field = (name) => (event) => setForm((value) => ({ ...value, [name]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault(); setError(""); setSuccess("");
    if (!form.name.trim() || !form.email.trim()) return setError("이름과 이메일을 입력해 주세요.");
    if (form.newPassword && form.newPassword.length < 8) return setError("새 비밀번호는 8자 이상이어야 합니다.");
    if (form.newPassword !== form.newPasswordConfirm) return setError("새 비밀번호가 일치하지 않습니다.");
    if (form.newPassword && !form.currentPassword) return setError("현재 비밀번호를 입력해 주세요.");
    setSubmitting(true);
    try {
      await updateProfile({ name: form.name.trim(), email: form.email.trim(), currentPassword: form.newPassword ? form.currentPassword : null, newPassword: form.newPassword || null });
      setForm((value) => ({ ...value, currentPassword: "", newPassword: "", newPasswordConfirm: "" }));
      setSuccess("프로필이 저장되었습니다.");
    } catch (requestError) { setError(getApiErrorMessage(requestError, "프로필을 저장하지 못했습니다.")); }
    finally { setSubmitting(false); }
  };
  return <form className={styles.form} onSubmit={submit}>
    <section className={styles.section}><div className={styles.sectionHead}><h2>기본 정보</h2><p>서비스에 표시되는 이름과 로그인 이메일입니다.</p></div>
      <label>이름<input value={form.name} onChange={field("name")} autoComplete="name" maxLength={100} required /></label>
      <label>이메일<input type="email" value={form.email} onChange={field("email")} autoComplete="email" maxLength={254} required /></label>
      <label>권한<input value={initialUser.role} disabled /></label>
    </section>
    <section className={styles.section}><div className={styles.sectionHead}><h2>비밀번호 변경</h2><p>변경하지 않으려면 아래 항목을 비워두세요.</p></div>
      <label>현재 비밀번호<input type="password" value={form.currentPassword} onChange={field("currentPassword")} autoComplete="current-password" /></label>
      <div className={styles.passwordGrid}><label>새 비밀번호<input type="password" value={form.newPassword} onChange={field("newPassword")} autoComplete="new-password" minLength={8} placeholder="8자 이상" /></label><label>새 비밀번호 확인<input type="password" value={form.newPasswordConfirm} onChange={field("newPasswordConfirm")} autoComplete="new-password" minLength={8} /></label></div>
    </section>
    <ErrorMessage message={error} />{success && <p className={styles.success} role="status">{success}</p>}
    <div className={styles.actions}><button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? "저장 중..." : "변경사항 저장"}</button></div>
  </form>;
}

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, updateProfile } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!isLoading && !isAuthenticated) router.replace(ROUTES.login); }, [isAuthenticated, isLoading, router]);
  if (isLoading || !user) return <div className={styles.loading}>사용자 정보를 확인하고 있습니다.</div>;
  return <section className={styles.page}><header className={styles.header}><span>MY ACCOUNT</span><h1>프로필 수정</h1><p>계정 정보와 비밀번호를 안전하게 관리하세요.</p></header><ProfileForm initialUser={user} updateProfile={updateProfile} /></section>;
}
