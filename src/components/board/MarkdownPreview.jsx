import { Children, isValidElement } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import MermaidDiagram from './MermaidDiagram';

const markdownSchema = {
  ...defaultSchema,
  tagNames:[...(defaultSchema.tagNames || []), 'details', 'summary'],
  attributes:{ ...defaultSchema.attributes, details:[...(defaultSchema.attributes?.details || []), 'open'] },
};

export default function MarkdownPreview({ content, variant = 'editor' }) {
  if (!content.trim()) {
    return (
      <div className="markdown-empty">
        <strong>미리볼 내용이 없습니다.</strong>
        <p>작성 탭에서 내용을 입력해 주세요.</p>
      </div>
    );
  }

  return (
    <div className={`markdown-preview ${variant === 'article' ? 'article-markdown' : ''}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, markdownSchema]]}
        components={{
          a: ({ href, children, ...props }) => {
            const isExternal = href?.startsWith('http://') || href?.startsWith('https://');
            return <a href={href} target={isExternal ? '_blank' : undefined} rel={isExternal ? 'noopener noreferrer' : undefined} {...props}>{children}</a>;
          },
          table: ({ children, ...props }) => <div className="markdown-table-wrap"><table {...props}>{children}</table></div>,
          code: ({ className, children, ...props }) => {
            const language = /language-([^\s]+)/.exec(className || '')?.[1];
            const source = String(children).replace(/\n$/, '');
            if (language === 'mermaid') return <MermaidDiagram chart={source} className={className} />;
            return <code className={className} data-language={language || undefined} {...props}>{children}</code>;
          },
          pre: ({ children }) => {
            const child = Children.count(children) === 1 ? Children.only(children) : null;
            const language = isValidElement(child) ? /language-([^\s]+)/.exec(child.props.className || '')?.[1] : undefined;
            if (language === 'mermaid') return <div className="mermaid-block">{children}</div>;
            return <div className="markdown-code-block">{language && <span className="code-language">{language}</span>}<pre>{children}</pre></div>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
