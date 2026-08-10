"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { boardService } from "@/services/boardService";
import { getApiErrorMessage } from "@/services/apiClient";
import { useAuth } from "@/hooks/useAuth";
import MarkdownEditor from "./MarkdownEditor";

const DRAFT_KEY = "hawk_ai_board_draft";
const CATEGORIES = [
  { id: 1, name: "개발 기록" },
  { id: 2, name: "점검 결과" },
  { id: 3, name: "프로젝트 공지" },
  { id: 4, name: "수거 요청" },
];
const EMPTY_FORM = { categoryId: 1, title: "", summary: "", content: "", tags: [] };
const EMPTY_AI_INPUT = {
  location: "",
  wasteSummary: "",
  priority: "",
  notes: "",
};

function validate(form) {
  const errors = {};
  if (!form.title.trim()) errors.title = "제목을 입력해 주세요.";
  else if (form.title.trim().length < 2) errors.title = "제목은 2자 이상 입력해 주세요.";
  if (!form.content.trim()) errors.content = "본문을 입력해 주세요.";
  else if (form.content.trim().length < 10) errors.content = "본문은 10자 이상 입력해 주세요.";
  return errors;
}

export default function BoardForm({ boardId }) {
  const isEdit = Boolean(boardId);
  const [form, setForm] = useState(EMPTY_FORM);
  const [originalForm, setOriginalForm] = useState(EMPTY_FORM);
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState("");
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [aiInput, setAIInput] = useState(EMPTY_AI_INPUT);
  const [aiGenerating, setAIGenerating] = useState(false);
  const [aiError, setAIError] = useState("");
  const titleRef = useRef(null);
  const contentRef = useRef(null);
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!isEdit) {
      Promise.resolve().then(() => {
        try {
          const saved = JSON.parse(localStorage.getItem(DRAFT_KEY));
          if (saved?.title || saved?.content) setForm({ ...EMPTY_FORM, ...saved });
        } catch { localStorage.removeItem(DRAFT_KEY); }
      });
      return;
    }
    let cancelled = false;
    boardService.detail(boardId)
      .then((post) => {
        if (cancelled) return;
        const loaded = {
          categoryId: post.categoryId,
          title: post.title,
          summary: post.summary || "",
          content: post.content,
          tags: post.tags || [],
        };
        setForm(loaded);
        setOriginalForm(loaded);
      })
      .catch((error) => {
        if (!cancelled) setNotice(getApiErrorMessage(error, "게시글을 불러오지 못했습니다."));
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [boardId, isEdit]);

  useEffect(() => {
    const applyAIDraft = () => {
      try {
        const saved = JSON.parse(localStorage.getItem(DRAFT_KEY));
        if (saved?.title && saved?.content) setForm({ ...EMPTY_FORM, ...saved });
      } catch { /* Ignore malformed local drafts. */ }
    };
    window.addEventListener("hawk-ai:board-draft-ready", applyAIDraft);
    return () => window.removeEventListener("hawk-ai:board-draft-ready", applyAIDraft);
  }, []);

  useEffect(() => {
    if (isEdit || loading || (!form.title && !form.content && !form.tags.length)) return;
    const timer = window.setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    }, 700);
    return () => window.clearTimeout(timer);
  }, [form, isEdit, loading]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setNotice("");
  };

  const addTag = () => {
    const tag = tagInput.trim().replace(/^#/, "");
    if (!tag) return;
    if (tag.length > 20) return setErrors((current) => ({ ...current, tags: "태그는 20자 이하로 입력해 주세요." }));
    if (form.tags.length >= 8) return setErrors((current) => ({ ...current, tags: "태그는 최대 8개까지 추가할 수 있습니다." }));
    if (!form.tags.some((item) => item.toLowerCase() === tag.toLowerCase())) {
      updateField("tags", [...form.tags, tag]);
    }
    setTagInput("");
  };

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (nextErrors.title) return titleRef.current?.focus();
    if (nextErrors.content) return contentRef.current?.focus();
    if (!isAuthenticated) {
      setNotice("로그인 후 게시글을 저장할 수 있습니다.");
      router.push("/login");
      return;
    }
    try {
      setSubmitting(true);
      setNotice("");
      const saved = isEdit
        ? await boardService.update(boardId, form)
        : await boardService.create({ ...form, summary: form.summary || null });
      if (!isEdit) localStorage.removeItem(DRAFT_KEY);
      router.push(`/boards/${saved.id}`);
      router.refresh();
    } catch (error) {
      setNotice(getApiErrorMessage(error, `게시글을 ${isEdit ? "수정" : "등록"}하지 못했습니다.`));
      setSubmitting(false);
    }
  };

  const generateAIDraft = async () => {
    if (!aiInput.location.trim() || !aiInput.wasteSummary.trim()) {
      setAIError("위치와 폐기물 현황을 입력해 주세요.");
      return;
    }
    if (!isAuthenticated) {
      setAIError("로그인 후 AI 글 생성을 사용할 수 있습니다.");
      return;
    }
    try {
      setAIGenerating(true);
      setAIError("");
      const category = CATEGORIES.find((item) => item.id === form.categoryId);
      const job = await boardService.generateDraft({
        location: aiInput.location.trim(),
        wasteSummary: aiInput.wasteSummary.trim(),
        priority: aiInput.priority.trim() || null,
        category: category?.name || null,
        notes: aiInput.notes.trim() || null,
      });
      localStorage.setItem(
        `hawk_ai_board_job_${job.jobId}`,
        JSON.stringify({ categoryId: form.categoryId }),
      );
      setNotice("AI 글 생성을 시작했습니다. 완료되면 상단 알림에서 확인할 수 있습니다.");
      setShowAIDialog(false);
      setAIInput(EMPTY_AI_INPUT);
    } catch (error) {
      setAIError(getApiErrorMessage(error, "AI 글을 생성하지 못했습니다."));
    } finally {
      setAIGenerating(false);
    }
  };

  if (loading || authLoading) return <p className="board-state">게시글 정보를 불러오는 중입니다.</p>;

  return (
    <article className="card board-editor-card">
      <form className="wide-board-form" onSubmit={submit} noValidate>
        <div className="board-editor-fields">
          <label htmlFor="board-category">카테고리
            <select id="board-category" value={form.categoryId} onChange={(event) => updateField("categoryId", Number(event.target.value))}>
              {CATEGORIES.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}
            </select>
          </label>
          <label htmlFor="board-title">제목
            <input id="board-title" ref={titleRef} className={`input ${errors.title ? "input-error" : ""}`} value={form.title} onChange={(event) => updateField("title", event.target.value)} maxLength={100} />
            {errors.title && <span className="field-error">{errors.title}</span>}
          </label>
          <label className="tag-field" htmlFor="board-summary">요약
            <input id="board-summary" className="input" value={form.summary} onChange={(event) => updateField("summary", event.target.value)} maxLength={500} placeholder="게시글 요약을 입력하세요" />
          </label>
          <label className="tag-field" htmlFor="board-tags">태그
            <div className={`tag-input-box ${errors.tags ? "input-error" : ""}`}>
              {form.tags.map((tag) => (
                <span className="tag-chip" key={tag}>#{tag}
                  <button type="button" onClick={() => updateField("tags", form.tags.filter((item) => item !== tag))} aria-label={`${tag} 태그 삭제`}>×</button>
                </span>
              ))}
              <input id="board-tags" value={tagInput} onChange={(event) => setTagInput(event.target.value.replace(",", ""))} onKeyDown={(event) => { if (event.key === "Enter" || event.key === ",") { event.preventDefault(); addTag(); } }} onBlur={addTag} placeholder="Enter 또는 쉼표로 태그 추가" />
            </div>
            <span className="tag-help">최대 8개 · 태그당 20자</span>
            {errors.tags && <span className="field-error">{errors.tags}</span>}
          </label>
        </div>
        <MarkdownEditor
          title={form.title}
          content={form.content}
          error={errors.content}
          contentRef={contentRef}
          onContentChange={(value) => updateField("content", value)}
          onImageUpload={(file) => boardService.uploadImage(file)}
        />
        <div className="editor-form-footer">
          <div>{notice && <p className="board-save-notice" role="alert">{notice}</p>}</div>
          <div className="form-actions">
            {!isEdit && <button type="button" className="btn btn-soft" onClick={() => { setAIError(""); setShowAIDialog(true); }}>AI 글 생성</button>}
            <button type="button" className="btn btn-soft" onClick={() => setForm(isEdit ? originalForm : EMPTY_FORM)}>초기화</button>
            <button type="button" className="btn btn-secondary" onClick={() => router.back()}>취소</button>
            <button className="btn btn-primary" disabled={submitting}>{submitting ? "저장 중..." : isEdit ? "수정 저장" : "게시글 등록"}</button>
          </div>
        </div>
      </form>
      {showAIDialog && (
        <div className="dialog-backdrop" role="presentation">
          <section className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="ai-board-title">
            <h2 id="ai-board-title">AI 게시글 초안 생성</h2>
            <p>입력한 사실만 사용해 제목, 요약, Markdown 본문을 생성합니다.</p>
            <label htmlFor="ai-location">위치
              <input id="ai-location" className="input" value={aiInput.location} onChange={(event) => setAIInput((current) => ({ ...current, location: event.target.value }))} placeholder="예: 광안리 해변" />
            </label>
            <label htmlFor="ai-waste-summary">폐기물 현황
              <textarea id="ai-waste-summary" className="input" value={aiInput.wasteSummary} onChange={(event) => setAIInput((current) => ({ ...current, wasteSummary: event.target.value }))} placeholder="예: 페트병 12개, 스티로폼 4개" rows={3} />
            </label>
            <label htmlFor="ai-priority">우선순위 (선택)
              <input id="ai-priority" className="input" value={aiInput.priority} onChange={(event) => setAIInput((current) => ({ ...current, priority: event.target.value }))} placeholder="예: 높음" />
            </label>
            <label htmlFor="ai-notes">현장 메모 (선택)
              <textarea id="ai-notes" className="input" value={aiInput.notes} onChange={(event) => setAIInput((current) => ({ ...current, notes: event.target.value }))} placeholder="추가로 반영할 사실을 입력하세요" rows={3} />
            </label>
            {aiError && <p className="board-save-notice board-save-error" role="alert">{aiError}</p>}
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" disabled={aiGenerating} onClick={() => setShowAIDialog(false)}>취소</button>
              <button type="button" className="btn btn-primary" disabled={aiGenerating} onClick={generateAIDraft}>{aiGenerating ? "생성 중..." : "초안 생성"}</button>
            </div>
          </section>
        </div>
      )}
    </article>
  );
}
