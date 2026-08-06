# Migration Status

최종 갱신: 2026-08-06

## 완료

- Next.js 16 App Router 전환
- Vite 및 React Router 제거
- 공통 Header, 모바일 메뉴, Footer
- `로고1.png` 로고와 `favicon.jpg` 패비콘 적용
- 공통 이미지를 `public/images/common`, HOME 이미지를 `public/images/home`에서 관리
- HOME 서비스 소개 및 분석 예시 이미지
- 로그인·회원가입 UI
- JWT 저장 유틸리티, 인증 Context, Axios 토큰 인터셉터
- 게시판 목록 프론트 구조와 샘플 데이터 fallback
- 게시판 작성·수정 공통 2열 Markdown 편집기
- 제목·본문 검증, 카테고리 및 태그 입력
- 작성 내용 자동 임시 저장·복원·삭제
- GFM, Mermaid, Python 코드와 안전한 접기 영역 미리보기
- 도형형 Markdown 작성 도구 모음
- 블로그형 게시글 상세 화면
- 사용자용 공통 준비 중/404 화면
- 공통 컴포넌트 및 서비스 분리
- 협업 문서 작성

## 현재 게시판 동작

- 목록: FastAPI 목록 API 호출을 시도하고 실패하면 프론트 샘플 데이터를 표시
- 상세: 프론트 샘플 데이터를 Markdown 블로그 레이아웃으로 표시
- 작성: 클라이언트 검증과 임시 저장만 수행하며 서버에 등록하지 않음
- 수정: 프론트 샘플 데이터 편집 UI이며 서버에 저장하지 않음
- 삭제: 서버 저장 기능 미구현

## 미구현 페이지

- 현장점검: 미구현 — 공통 준비 중 안내 화면 연결
- 점검이력: 미구현 — 공통 준비 중 안내 화면 연결
- 점검 상세: 미구현 — 공통 준비 중 안내 화면 연결
- 통계분석: 미구현 — 공통 준비 중 안내 화면 연결

## FastAPI 연동 대기

- 로그인 및 회원가입 API
- 사용자 조회 API
- 게시판 CRUD API
- 게시판 검색 및 페이징 API
- 현장점검 API
- 점검이력 API
- 탐지 API
- 통계 API

## Backend 점검

```text
Backend 점검: 미실행
사유: 현재 프론트엔드 작업 공간에 backend 저장소가 포함되어 있지 않음
백엔드 기술 스택: FastAPI + MySQL + JWT
```

YOLO 또는 LLM을 별도 서버로 분리할지는 아직 확정되지 않았습니다.

## 최근 검증

```text
npm install: 완료
npm run lint: 통과
npm run build: 통과
Frontend Port: 3000
Backend: 현재 작업 공간에 저장소가 없어 미검증
```
