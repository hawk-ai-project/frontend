import Image from "next/image";
import Link from "next/link";
import { projectLinks, teamMembers } from "@/constants/footer";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <section className="footer-brand" aria-labelledby="footer-brand-title">
          <Link
            className="footer-brand-link"
            href="/"
            aria-label="Hawk-AI HOME으로 이동"
          >
            <span className="footer-logo">
              <Image
                src="/images/common/logo1.png"
                alt="Hawk-AI"
                width={150}
                height={56}
              />
            </span>
            <strong id="footer-brand-title">HAWK-AI</strong>
          </Link>
          <p>AI 기반 해안 폐기물 탐지 및 현장 점검 서비스</p>
        </section>

        <nav className="footer-project" aria-labelledby="footer-project-title">
          <h2 id="footer-project-title">PROJECT</h2>
          <ul>
            {projectLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${link.label} 새 탭에서 열기`}
                >
                  <span>{link.label}</span>
                  <span aria-hidden="true">↗</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <section className="footer-team" aria-labelledby="footer-team-title">
          <h2 id="footer-team-title">TEAM</h2>
          <ul>
            {teamMembers.map((member) => (
              <li key={member.name} title={member.details}>
                <div className="footer-member-heading">
                  <strong>{member.name}</strong>
                  {member.github ? (
                    <a
                      href={member.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${member.name} GitHub 새 탭에서 열기`}
                    >
                      GitHub ↗
                    </a>
                  ) : (
                    <span>GitHub 준비 중</span>
                  )}
                </div>
                <p>{member.role}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="footer-bottom">
        <span>© 2026 Hawk-AI Team. All rights reserved.</span>
        <span>AI-Based Coastal Waste Inspection Service</span>
      </div>
    </footer>
  );
}
