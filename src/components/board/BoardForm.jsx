'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { prototypeBoards } from './boardData';
import MarkdownEditor from './MarkdownEditor';

const DRAFT_KEY = 'hawk_ai_board_draft';
const CATEGORIES = ['개발 기록', '점검 결과', '프로젝트 공지', '수거 요청'];
const EMPTY_FORM = { category:'개발 기록', title:'', content:'', tags:[] };

function validate(title, content) {
  const errors = {};
  const trimmedTitle = title.trim();
  const trimmedContent = content.trim();
  if (!trimmedTitle) errors.title = '제목을 입력해 주세요.';
  else if (trimmedTitle.length < 2) errors.title = '제목은 2자 이상 입력해 주세요.';
  else if (title.length > 100) errors.title = '제목은 100자 이하로 입력해 주세요.';
  if (!trimmedContent) errors.content = '본문을 입력해 주세요.';
  else if (trimmedContent.length < 10) errors.content = '본문은 10자 이상 입력해 주세요.';
  else if (content.length > 10000) errors.content = '본문은 10000자 이하로 입력해 주세요.';
  return errors;
}

export default function BoardForm({ boardId }) {
  const isEdit = Boolean(boardId);
  const sample = prototypeBoards.find((item) => String(item.id) === String(boardId));
  const initialForm = isEdit && sample ? { category:sample.category, title:sample.title, content:sample.content, tags:sample.tags || [] } : EMPTY_FORM;
  const [form, setForm] = useState(initialForm);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});
  const [pendingDraft, setPendingDraft] = useState(null);
  const [draftReady, setDraftReady] = useState(isEdit);
  const [saveStatus, setSaveStatus] = useState('');
  const [notice, setNotice] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const titleRef = useRef(null);
  const contentRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (isEdit) return;
    Promise.resolve().then(() => {
      try {
        const saved = localStorage.getItem(DRAFT_KEY);
        if (!saved) { setDraftReady(true); return; }
        const parsed = JSON.parse(saved);
        if (typeof parsed.title === 'string' && typeof parsed.content === 'string') setPendingDraft({ ...EMPTY_FORM, ...parsed, tags:Array.isArray(parsed.tags) ? parsed.tags : [] });
        else setDraftReady(true);
      } catch {
        localStorage.removeItem(DRAFT_KEY);
        setDraftReady(true);
      }
    });
  }, [isEdit]);

  useEffect(() => {
    if (isEdit || !draftReady || (!form.title && !form.content && form.tags.length === 0)) return;
    const timer = window.setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...form, savedAt:new Date().toISOString() }));
      setSaveStatus('임시 저장됨');
    }, 700);
    return () => window.clearTimeout(timer);
  }, [form, isEdit, draftReady]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]:value }));
    setNotice('');
    if (!isEdit) setSaveStatus('저장 중...');
    if (errors[field]) setErrors((current) => ({ ...current, [field]:undefined }));
  };

  const addTag = (rawValue = tagInput) => {
    const tag = rawValue.trim().replace(/^#/, '');
    if (!tag) return setTagInput('');
    if (tag.length > 20) return setErrors((current) => ({ ...current, tags:'태그는 20자 이하로 입력해 주세요.' }));
    if (form.tags.length >= 8) return setErrors((current) => ({ ...current, tags:'태그는 최대 8개까지 추가할 수 있습니다.' }));
    if (form.tags.some((item) => item.toLowerCase() === tag.toLowerCase())) return setErrors((current) => ({ ...current, tags:'이미 추가된 태그입니다.' }));
    updateField('tags', [...form.tags, tag]);
    setTagInput('');
    setErrors((current) => ({ ...current, tags:undefined }));
  };

  const handleTagKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ',') { event.preventDefault(); addTag(); }
    if (event.key === 'Backspace' && !tagInput && form.tags.length) updateField('tags', form.tags.slice(0, -1));
  };

  const restoreDraft = () => { setForm(pendingDraft); setPendingDraft(null); setDraftReady(true); setSaveStatus('임시 저장 내용 복원됨'); };
  const discardPendingDraft = () => { localStorage.removeItem(DRAFT_KEY); setPendingDraft(null); setDraftReady(true); };
  const clearDraft = () => { localStorage.removeItem(DRAFT_KEY); setForm(EMPTY_FORM); setTagInput(''); setErrors({}); setSaveStatus(''); setNotice(''); setShowDeleteConfirm(false); titleRef.current?.focus(); };
  const resetEdit = () => { setForm(initialForm); setTagInput(''); setErrors({}); setNotice(''); titleRef.current?.focus(); };

  const submit = (event) => {
    event.preventDefault();
    const nextErrors = validate(form.title, form.content);
    setErrors(nextErrors); setNotice('');
    if (nextErrors.title) { titleRef.current?.focus(); return; }
    if (nextErrors.content) { contentRef.current?.focus(); return; }
    setNotice(isEdit ? '게시글 수정 기능을 준비하고 있습니다. 변경한 내용은 현재 서버에 저장되지 않습니다.' : '게시판 저장 기능을 준비하고 있습니다. 작성한 내용은 현재 서버에 등록되지 않습니다.');
  };

  return (
    <article className="card board-editor-card">
      {pendingDraft && <section className="draft-restore" aria-labelledby="draft-restore-title"><div><strong id="draft-restore-title">작성 중이던 임시 저장 내용이 있습니다.</strong><p>카테고리와 태그를 포함해 불러오시겠습니까?</p></div><div className="draft-restore-actions"><button type="button" className="btn btn-primary" onClick={restoreDraft}>불러오기</button><button type="button" className="btn btn-secondary" onClick={discardPendingDraft}>삭제</button></div></section>}

      <form className="wide-board-form" onSubmit={submit} noValidate>
        <div className="board-editor-fields">
          <label htmlFor="board-category">카테고리<select id="board-category" value={form.category} onChange={(event) => updateField('category', event.target.value)}>{CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></label>
          <label htmlFor="board-title">제목<input id="board-title" ref={titleRef} className={`input ${errors.title ? 'input-error' : ''}`} value={form.title} onChange={(event) => updateField('title', event.target.value)} maxLength={100} placeholder="제목을 입력하세요" aria-invalid={Boolean(errors.title)} aria-describedby={errors.title ? 'title-error' : undefined} />{errors.title && <span id="title-error" className="field-error">{errors.title}</span>}</label>
          <label className="tag-field" htmlFor="board-tags">태그<div className={`tag-input-box ${errors.tags ? 'input-error' : ''}`}>{form.tags.map((tag) => <span className="tag-chip" key={tag}>#{tag}<button type="button" onClick={() => updateField('tags', form.tags.filter((item) => item !== tag))} aria-label={`${tag} 태그 삭제`}>×</button></span>)}<input id="board-tags" value={tagInput} onChange={(event) => setTagInput(event.target.value.replace(',', ''))} onKeyDown={handleTagKeyDown} onBlur={() => tagInput.trim() && addTag()} placeholder={form.tags.length ? '태그 추가' : 'Enter 또는 쉼표로 태그를 추가하세요'} /></div><span className="tag-help">최대 8개 · 태그당 20자</span>{errors.tags && <span className="field-error">{errors.tags}</span>}</label>
        </div>

        <MarkdownEditor title={form.title} content={form.content} error={errors.content} contentRef={contentRef} onContentChange={(value) => updateField('content', value)} />

        <div className="editor-form-footer"><div><span className="draft-status">{isEdit ? '프론트 샘플 데이터 편집 중' : saveStatus}</span>{notice && <p className="board-save-notice" role="status">{notice}</p>}</div><div className="form-actions">{isEdit ? <button type="button" className="btn btn-soft" onClick={resetEdit}>변경사항 초기화</button> : <button type="button" className="btn btn-soft" onClick={() => setShowDeleteConfirm(true)}>임시 저장 삭제</button>}<button type="button" className="btn btn-secondary" onClick={() => router.back()}>취소</button><button className="btn btn-primary">{isEdit ? '수정 저장' : '게시글 등록'}</button></div></div>
      </form>

      {showDeleteConfirm && <div className="dialog-backdrop" role="presentation"><section className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="draft-delete-title"><h2 id="draft-delete-title">임시 저장 내용을 삭제할까요?</h2><p>작성 중인 카테고리, 제목, 태그와 본문이 모두 초기화됩니다.</p><div className="form-actions"><button type="button" className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>계속 작성</button><button type="button" className="btn btn-primary" onClick={clearDraft}>삭제</button></div></section></div>}
    </article>
  );
}
