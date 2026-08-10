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
const EMPTY_FORM = { categoryId: 1, title: "", content: "", tags: [] };

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
        : await boardService.create({ ...form, summary: null });
      if (!isEdit) localStorage.removeItem(DRAFT_KEY);
      router.push(`/boards/${saved.id}`);
      router.refresh();
    } catch (error) {
      setNotice(getApiErrorMessage(error, `게시글을 ${isEdit ? "수정" : "등록"}하지 못했습니다.`));
      setSubmitting(false);
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
        <MarkdownEditor title={form.title} content={form.content} error={errors.content} contentRef={contentRef} onContentChange={(value) => updateField("content", value)} />
        <div className="editor-form-footer">
          <div>{notice && <p className="board-save-notice" role="alert">{notice}</p>}</div>
          <div className="form-actions">
            <button type="button" className="btn btn-soft" onClick={() => setForm(isEdit ? originalForm : EMPTY_FORM)}>초기화</button>
            <button type="button" className="btn btn-secondary" onClick={() => router.back()}>취소</button>
            <button className="btn btn-primary" disabled={submitting}>{submitting ? "저장 중..." : isEdit ? "수정 저장" : "게시글 등록"}</button>
          </div>
        </div>
      </form>
    </article>
  );
}
