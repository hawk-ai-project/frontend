"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { adminService } from "@/services/adminService";
import { getApiErrorMessage } from "@/services/apiClient";
import ErrorMessage from "@/components/common/ErrorMessage";
import UserAvatar from "@/components/common/UserAvatar";

export default function AdminPermissionsPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([adminService.getUsers({ page: 1, pageSize: 100 }), adminService.getRoles()])
      .then(([userPage, roleItems]) => {
        if (cancelled) return;
        setUsers(userPage.items);
        setRoles(roleItems);
        setDrafts(Object.fromEntries(userPage.items.map((member) => [member.id, member.role])));
      })
      .catch((requestError) => { if (!cancelled) setError(getApiErrorMessage(requestError, "권한 정보를 불러오지 못했습니다.")); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const saveRole = async (member) => {
    const roleCode = drafts[member.id];
    if (!roleCode || roleCode === member.role) return;
    setSavingId(member.id); setError(""); setSuccess("");
    try {
      const updated = await adminService.updateUserRole(member.id, roleCode);
      setUsers((items) => items.map((item) => item.id === member.id ? { ...item, role: updated.role } : item));
      setDrafts((values) => ({ ...values, [member.id]: updated.role }));
      setSuccess(`${member.name} 회원의 권한을 ${updated.role}(으)로 변경했습니다.`);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "권한을 변경하지 못했습니다."));
    } finally { setSavingId(null); }
  };

  return (
    <div className="admin-page">
      <header className="admin-page-head"><div><span className="admin-kicker">MEMBERS</span><h1>권한 관리</h1><p>회원에게 부여된 서비스 역할과 접근 권한을 변경합니다.</p></div></header>
      <div className="admin-permission-notice"><strong>권한 변경 안내</strong><p>변경된 권한은 해당 회원이 다음 요청을 보낼 때부터 적용됩니다. 현재 로그인한 본인 계정은 변경할 수 없습니다.</p></div>
      <ErrorMessage message={error} />
      {success && <p className="admin-success-message" role="status">{success}</p>}
      <section className="admin-panel">
        <div className="admin-toolbar"><div><h2>회원별 권한</h2><p>DB의 roles 테이블에 등록된 권한을 선택할 수 있습니다.</p></div></div>
        {loading ? <div className="admin-data-loading"><span className="admin-spinner" />권한 정보를 불러오고 있습니다.</div> : (
          <div className="admin-table-wrap"><table className="admin-table admin-permission-table"><thead><tr><th>회원</th><th>현재 권한</th><th>변경할 권한</th><th>적용</th></tr></thead><tbody>
            {users.map((member) => {
              const isSelf = member.id === currentUser?.id;
              const changed = drafts[member.id] !== member.role;
              return <tr key={member.id}><td><div className="admin-member"><UserAvatar user={member} adminUserId={member.id} /><div><strong>{member.name}</strong><small>{member.email}</small></div></div></td><td><span className="role-badge">{member.role}</span></td><td><select value={drafts[member.id] || member.role} disabled={isSelf || savingId === member.id} onChange={(event) => setDrafts((values) => ({ ...values, [member.id]: event.target.value }))}>{roles.map((role) => <option value={role.code} key={role.code}>{role.name} ({role.code})</option>)}</select>{isSelf && <small className="permission-self-label">현재 로그인 계정</small>}</td><td><button type="button" className="permission-save-btn" disabled={isSelf || !changed || savingId === member.id} onClick={() => saveRole(member)}>{savingId === member.id ? "저장 중..." : "변경 저장"}</button></td></tr>;
            })}
            {!users.length && <tr><td colSpan="4" className="admin-empty-cell">등록된 회원이 없습니다.</td></tr>}
          </tbody></table></div>
        )}
      </section>
    </div>
  );
}
