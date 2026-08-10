import AdminShell from "@/components/admin/AdminShell";
import "./admin.css";

export const metadata = { title: { default: "관리자", template: "%s | 관리자" } };

export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}
