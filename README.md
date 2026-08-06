# Hawk-AI Frontend

AI 기반 해안 폐기물 탐지 및 현장 점검 서비스를 위한 Next.js 프론트엔드입니다.

## 기술 스택

- Frontend: Next.js 16 App Router, React 19, JavaScript
- HTTP: Axios
- Markdown: react-markdown, remark-gfm
- 안전한 HTML: rehype-raw, rehype-sanitize
- Diagram: Mermaid
- Frontend Port: `3000`

백엔드는 별도 저장소인 [hawk-ai-project/backend](https://github.com/hawk-ai-project/backend)에서 FastAPI + MySQL + JWT로 개발하며 기본 포트는 `8000`입니다. MySQL 기본 포트는 `3306`입니다.

## 실행

```bash
copy .env.example .env.local
npm install
npm run dev
```

검증 명령:

```bash
npm run lint
npm run build
```

## 주요 경로

- `/`: HOME
- `/login`, `/signup`: 로그인·회원가입 UI
- `/boards`: 게시판 목록과 프론트 샘플 데이터
- `/boards/write`: Markdown 게시글 작성
- `/boards/[id]`: 블로그형 Markdown 게시글 상세
- `/boards/[id]/edit`: Markdown 게시글 수정
- `/inspection`: 미구현 — 공통 준비 중 안내 화면 연결
- `/histories`, `/histories/*`: 미구현 — 공통 준비 중 안내 화면 연결
- `/analytics`: 미구현 — 공통 준비 중 안내 화면 연결
- 그 외 존재하지 않는 경로: 공통 사용자용 오류 화면

## 게시판 프론트 기능

- 작성·수정 화면의 2열 편집기와 실시간 미리보기
- 제목, 카테고리, 태그 입력 및 클라이언트 검증
- 브라우저 임시 저장·복원·삭제 (`hawk_ai_board_draft`)
- GFM 표, 체크박스, 취소선, 인용문, 링크와 코드 블록
- Mermaid 다이어그램과 Python 코드 블록
- 클릭으로 문법을 삽입하는 Markdown 도구 모음
- 안전하게 정제된 `details`/`summary` 접기 영역
- 블로그형 상세 레이아웃, 읽기 시간, 태그, 이전·다음 글

게시글 작성·수정·삭제는 아직 서버에 저장되지 않습니다. 검증 성공 시에도 미연동 안내만 표시합니다. 게시판 목록은 FastAPI 호출을 시도하며 응답이 없으면 프론트 샘플 데이터를 유지합니다.

협업 규칙과 상세 기술 문서는 [docs](./docs)에서 확인할 수 있습니다.
