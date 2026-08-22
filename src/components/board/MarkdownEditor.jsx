import { useRef, useState } from "react";
import Image from "next/image";
import { getApiErrorMessage } from "@/services/apiClient";
import MarkdownPreview from "./MarkdownPreview";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const IMAGE_MAX_SIZE = 10 * 1024 * 1024;
const EMOTICONS = Array.from({ length: 30 }, (_, index) => String(index + 1).padStart(2, "0"));

const toolbarItems = [
  { label: "제목", icon: "H", before: "## ", after: "", placeholder: "소제목" },
  {
    label: "굵게",
    icon: "B",
    before: "**",
    after: "**",
    placeholder: "굵은 글씨",
  },
  {
    label: "기울임",
    icon: "I",
    before: "*",
    after: "*",
    placeholder: "기울임",
  },
  {
    label: "취소선",
    icon: "S",
    before: "~~",
    after: "~~",
    placeholder: "취소선",
  },
  {
    label: "글머리 목록",
    icon: "•",
    before: "- ",
    after: "",
    placeholder: "목록 항목",
  },
  {
    label: "번호 목록",
    icon: "1.",
    before: "1. ",
    after: "",
    placeholder: "순서 항목",
  },
  {
    label: "체크박스",
    icon: "☑",
    before: "- [ ] ",
    after: "",
    placeholder: "할 일",
  },
  {
    label: "인용문",
    icon: "❯",
    before: "> ",
    after: "",
    placeholder: "인용문",
  },
  {
    label: "인라인 코드",
    icon: "<>",
    before: "`",
    after: "`",
    placeholder: "code",
  },
  {
    label: "링크",
    icon: "↗",
    before: "[",
    after: "](https://)",
    placeholder: "링크 이름",
  },
  { label: "구분선", icon: "—", block: "\n---\n" },
  {
    label: "표",
    icon: "▦",
    block: "\n| 항목 | 내용 |\n|---|---|\n| 탐지 수 | 20개 |\n",
  },
  {
    label: "접기 영역",
    icon: "▾",
    block:
      "\n<details>\n<summary>제목</summary>\n<div>\n\n접어서 표시할 내용을 입력하세요.\n\n</div>\n</details>\n",
  },
  {
    label: "Mermaid 다이어그램",
    icon: "◇",
    block: "\n```mermaid\ngraph LR\n  A[탐지] --> B[분석]\n```\n",
  },
  {
    label: "Python 코드",
    icon: "Py",
    block: '\n```python\nprint("Hawk-AI")\n```\n',
  },
  {
    label: "일반 코드 블록",
    icon: "{}",
    block: "\n```text\n코드를 입력하세요.\n```\n",
  },
];

export default function MarkdownEditor({
  title,
  content,
  error,
  contentRef,
  onContentChange,
  onImageUpload,
}) {
  const imageInputRef = useRef(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState("");
  const [showEmoticons, setShowEmoticons] = useState(false);

  const insertMarkdown = (item) => {
    const textarea = contentRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.slice(start, end);
    const insertion =
      item.block ||
      `${item.before}${selected || item.placeholder}${item.after}`;
    onContentChange(
      `${content.slice(0, start)}${insertion}${content.slice(end)}`,
    );
    const selectionStart =
      start + (item.block ? insertion.length : item.before.length);
    const selectionEnd = item.block
      ? selectionStart
      : selectionStart + (selected || item.placeholder).length;
    window.requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(selectionStart, selectionEnd);
    });
  };

  const uploadImage = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type)) {
      setImageError("JPEG, PNG, WebP, GIF 이미지만 추가할 수 있습니다.");
      return;
    }
    if (file.size > IMAGE_MAX_SIZE) {
      setImageError("이미지는 10MB 이하만 추가할 수 있습니다.");
      return;
    }

    const textarea = contentRef.current;
    const start = textarea?.selectionStart ?? content.length;
    const end = textarea?.selectionEnd ?? start;
    try {
      setImageUploading(true);
      setImageError("");
      const uploaded = await onImageUpload(file);
      const alt = file.name.replace(/\.[^.]+$/, "").replace(/[\[\]]/g, "").trim() || "게시글 이미지";
      const markdown = `\n\n![${alt}](${uploaded.imageUrl})\n\n`;
      onContentChange(`${content.slice(0, start)}${markdown}${content.slice(end)}`);
      window.requestAnimationFrame(() => {
        const nextPosition = start + markdown.length;
        textarea?.focus();
        textarea?.setSelectionRange(nextPosition, nextPosition);
      });
    } catch (error) {
      setImageError(getApiErrorMessage(error, "이미지를 추가하지 못했습니다."));
    } finally {
      setImageUploading(false);
    }
  };

  const insertEmoticon = (name) => {
    insertMarkdown({
      block: `\n\n![이모티콘 ${Number(name)}](/images/emoticons/${name}.png)\n\n`,
    });
    setShowEmoticons(false);
  };

  return (
    <div className="editor-grid">
      <section
        className="content-card editor-work-panel"
        aria-labelledby="markdown-write-title"
      >
        <div className="editor-panel-head">
          <div>
            <h2 id="markdown-write-title">Markdown 작성</h2>
            <p>
              도구를 누르면 선택한 문장에 서식이 적용되거나 예제가 삽입됩니다.
            </p>
          </div>
          <span>{content.length.toLocaleString()} / 10,000자</span>
        </div>
        <div
          className="markdown-toolbar"
          role="toolbar"
          aria-label="Markdown 작성 도구"
        >
          {toolbarItems.map((item) => (
            <button
              type="button"
              key={item.label}
              className="markdown-tool"
              onClick={() => insertMarkdown(item)}
              aria-label={item.label}
              title={item.label}
            >
              <span aria-hidden="true">{item.icon}</span>
              <small>{item.label}</small>
            </button>
          ))}
          <button
            type="button"
            className="markdown-tool markdown-image-tool"
            onClick={() => imageInputRef.current?.click()}
            disabled={imageUploading}
            aria-label="본문 이미지 추가"
            title="본문 이미지 추가"
          >
            <span aria-hidden="true">▧</span>
            <small>{imageUploading ? "업로드 중" : "이미지 첨부"}</small>
          </button>
          <input
            ref={imageInputRef}
            className="markdown-image-input"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={uploadImage}
            tabIndex={-1}
          />
          <button
            type="button"
            className="markdown-tool markdown-emoticon-tool"
            onClick={() => setShowEmoticons((value) => !value)}
            aria-expanded={showEmoticons}
            aria-label="게시글 이모티콘 추가"
            title="게시글 이모티콘 추가"
          >
            <span aria-hidden="true">😊</span>
            <small>이모티콘</small>
          </button>
        </div>
        {showEmoticons && (
          <div className="markdown-emoticon-picker" aria-label="게시글 이모티콘 선택">
            {EMOTICONS.map((name) => (
              <button type="button" key={name} onClick={() => insertEmoticon(name)}>
                <Image src={`/images/emoticons/${name}.png`} alt={`이모티콘 ${Number(name)}`} width={54} height={54} />
              </button>
            ))}
          </div>
        )}
        {imageError && <p className="markdown-image-error" role="alert">{imageError}</p>}
        <textarea
          ref={contentRef}
          className={`markdown-live-textarea ${error ? "input-error" : ""}`}
          value={content}
          onChange={(event) => onContentChange(event.target.value)}
          maxLength={10000}
          placeholder="상단 도구를 누르거나 내용을 바로 입력하세요."
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "content-error" : undefined}
          disabled={imageUploading}
        />
        {error && (
          <p id="content-error" className="field-error">
            {error}
          </p>
        )}
      </section>

      <section
        className="content-card editor-preview-panel"
        aria-labelledby="markdown-preview-title"
      >
        <div className="editor-panel-head">
          <div>
            <h2 id="markdown-preview-title">실시간 미리보기</h2>
            <p>입력한 서식과 접기 영역이 즉시 반영됩니다.</p>
          </div>
        </div>
        <div className="live-preview-title">
          {title.trim() || "제목을 입력해 주세요."}
        </div>
        {content.trim() ? (
          <MarkdownPreview content={content} variant="article" />
        ) : (
          <div className="live-preview-empty">
            작성한 내용이 이곳에 표시됩니다.
          </div>
        )}
      </section>
    </div>
  );
}
