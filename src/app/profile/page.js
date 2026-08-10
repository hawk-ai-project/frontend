"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/authService";
import { getApiErrorMessage } from "@/services/apiClient";
import { ROUTES } from "@/constants/routes";
import ErrorMessage from "@/components/common/ErrorMessage";
import styles from "./profile.module.css";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function ProfileImageEditor({ user, updateProfileImage, deleteProfileImage }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    let objectUrl;
    if (user.profileFileId) {
      authService.getProfileImage().then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);
      }).catch(() => { if (active) setPreviewUrl(null); });
    }
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [user.profileFileId]);

  const selectFile = (event) => {
    const file = event.target.files?.[0];
    setError(""); setMessage("");
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type)) {
      setError("JPEG, PNG, WebP, GIF 이미지만 사용할 수 있습니다."); return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("프로필 이미지는 5MB 이하여야 합니다."); return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const save = async () => {
    if (!selectedFile) return;
    setSubmitting(true); setError(""); setMessage("");
    try {
      await updateProfileImage(selectedFile);
      setSelectedFile(null);
      setMessage("프로필 이미지가 변경되었습니다.");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "프로필 이미지를 변경하지 못했습니다."));
    } finally { setSubmitting(false); }
  };

  const remove = async () => {
    setSubmitting(true); setError(""); setMessage("");
    try {
      await deleteProfileImage();
      setSelectedFile(null); setPreviewUrl(null);
      setMessage("프로필 이미지가 삭제되었습니다.");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "프로필 이미지를 삭제하지 못했습니다."));
    } finally { setSubmitting(false); }
  };

  return <section className={styles.section}>
    <div className={styles.sectionHead}><h2>프로필 이미지</h2><p>JPEG, PNG, WebP, GIF · 최대 5MB</p></div>
    <div className={styles.avatarEditor}>
      <div className={styles.avatar}>
        {previewUrl ? <Image src={previewUrl} alt="프로필 미리보기" width={104} height={104} unoptimized /> : <span>{user.name?.slice(0, 1).toUpperCase()}</span>}
      </div>
      <div className={styles.avatarControls}>
        <label className={styles.fileButton}>이미지 선택<input type="file" accept={IMAGE_TYPES.join(",")} onChange={selectFile} /></label>
        <div className={styles.avatarActions}>
          <button type="button" onClick={save} disabled={!selectedFile || submitting}>변경 저장</button>
          {user.profileFileId && <button type="button" className={styles.deleteButton} onClick={remove} disabled={submitting}>이미지 삭제</button>}
        </div>
      </div>
    </div>
    <ErrorMessage message={error} />
    {message && <p className={styles.success} role="status">{message}</p>}
  </section>;
}

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
  const { user, isAuthenticated, isLoading, updateProfile, updateProfileImage, deleteProfileImage } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!isLoading && !isAuthenticated) router.replace(ROUTES.login); }, [isAuthenticated, isLoading, router]);
  if (isLoading || !user) return <div className={styles.loading}>사용자 정보를 확인하고 있습니다.</div>;
  return <section className={styles.page}>
    <header className={styles.header}><span>MY ACCOUNT</span><h1>프로필 설정</h1><p>계정 정보와 프로필 이미지를 안전하게 관리하세요.</p></header>
    <div className={styles.form}>
      <ProfileImageEditor user={user} updateProfileImage={updateProfileImage} deleteProfileImage={deleteProfileImage} />
      <ProfileForm initialUser={user} updateProfile={updateProfile} />
    </div>
  </section>;
}
