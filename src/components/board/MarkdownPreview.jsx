import { Children, isValidElement } from "react";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import MermaidDiagram from "./MermaidDiagram";

const markdownSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames || []), "details", "summary"],
  attributes: {
    ...defaultSchema.attributes,
    details: [...(defaultSchema.attributes?.details || []), "open"],
  },
};

export default function MarkdownPreview({ content, variant = "editor" }) {
  if (!content || !content.trim()) {
    return (
      <div className="markdown-empty">
        <strong>미리볼 내용이 없습니다.</strong>
        <p>작성 탭에서 내용을 입력해 주세요.</p>
      </div>
    );
  }

  return (
    <div
      className={`markdown-preview ${variant === "article" ? "article-markdown" : ""}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, markdownSchema]]}
        components={{
          a: ({ href, children, className, style, ...props }) => {
            const isExternal =
              href?.startsWith("http://") || href?.startsWith("https://");

            // 구버전 쿼리 파라미터(?inspectionId=96)를 /histories/96 경로로 변환
            let targetHref = href || "";
            if (targetHref.includes("/histories?inspectionId=")) {
              targetHref = targetHref.replace(
                /\/histories\?inspectionId=(\d+)/,
                "/histories/$1",
              );
            }

            const isInspectionLink = targetHref.startsWith("/histories");

            // 첫 번째 캡처 이미지와 완전히 동일한 버튼 디자인 스타일 적용
            const inspectionButtonStyle = {
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#4175df", // 원본의 밝은 파란색
              color: "#ffffff",
              textDecoration: "none", // 밑줄 제거
              fontWeight: "700",
              fontSize: "16px",
              padding: "12px 24px",
              borderRadius: "12px",
              boxShadow: "0 4px 14px rgba(65, 117, 223, 0.3)",
              lineHeight: "1.4",
              margin: "8px 0",
            };

            const linkStyle = isInspectionLink
              ? { ...style, ...inspectionButtonStyle }
              : style;

            const linkClassName = [
              className,
              isInspectionLink ? "btn-inspection-link" : "",
            ]
              .filter(Boolean)
              .join(" ");

            if (!isExternal && targetHref.startsWith("/")) {
              return (
                <Link
                  href={targetHref}
                  className={linkClassName || undefined}
                  style={linkStyle}
                  {...props}
                >
                  {children}
                </Link>
              );
            }

            return (
              <a
                href={targetHref}
                className={linkClassName || undefined}
                style={linkStyle}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                {...props}
              >
                {children}
              </a>
            );
          },
          table: ({ children, ...props }) => (
            <div className="markdown-table-wrap">
              <table {...props}>{children}</table>
            </div>
          ),
          img: ({ src, alt }) => {
            const isEmoticon = /^\/images\/emoticons\/\d{2}\.png$/.test(
              src || "",
            );
            if (isEmoticon) {
              return (
                <Image
                  className="article-emoticon"
                  src={src}
                  alt={alt || "게시글 이모티콘"}
                  width={120}
                  height={120}
                />
              );
            }
            // eslint-disable-next-line @next/next/no-img-element
            return <img src={src} alt={alt || "게시글 이미지"} />;
          },
          code: ({ className, children, ...props }) => {
            const language = /language-([^\s]+)/.exec(className || "")?.[1];
            const source = String(children).replace(/\n$/, "");
            if (language === "mermaid")
              return <MermaidDiagram chart={source} className={className} />;
            return (
              <code
                className={className}
                data-language={language || undefined}
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: ({ children }) => {
            const child =
              Children.count(children) === 1 ? Children.only(children) : null;
            const language = isValidElement(child)
              ? /language-([^\s]+)/.exec(child.props.className || "")?.[1]
              : undefined;
            if (language === "mermaid")
              return <div className="mermaid-block">{children}</div>;
            return (
              <div className="markdown-code-block">
                {language && <span className="code-language">{language}</span>}
                <pre>{children}</pre>
              </div>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
