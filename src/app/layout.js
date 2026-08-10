import "./globals.css";
import AppHeader from "@/components/layout/AppHeader";
import AppFooter from "@/components/layout/AppFooter";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata = {
  title: { default: "Hawk-AI", template: "%s | Hawk-AI" },
  description: "AI 기반 해양 폐기물 현장 점검 서비스",
  icons: { icon: "/images/common/favicon.jpg" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko" data-scroll-behavior="smooth">
      <body>
        <AuthProvider>
          <AppHeader />
          <main>{children}</main>
          <AppFooter />
        </AuthProvider>
      </body>
    </html>
  );
}
