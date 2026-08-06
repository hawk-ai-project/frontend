# Architecture

## 확정 기술 스택

```text
Next.js Frontend : 3000
FastAPI Backend  : 8000
MySQL            : 3306
Authentication   : JWT
```

- Frontend: Next.js 16 App Router, React 19, JavaScript, Axios
- Backend: 별도 저장소의 FastAPI
- Database: MySQL
- Authentication: JWT
- Backend Repository: `https://github.com/hawk-ai-project/backend`

YOLO 또는 LLM을 별도 서버로 분리할지는 아직 확정되지 않았으며, 프론트엔드 문서에서 별도 AI 서버를 전제로 하지 않습니다.

## 프론트엔드 구조

```text
src/
├─ app/          App Router 페이지, layout, not-found, 전역 CSS
├─ components/   layout, common, auth, home, board UI
├─ constants/    경로와 공통 상수
├─ contexts/     인증 Context
├─ services/     Axios 인스턴스와 API 서비스
└─ utils/        JWT 토큰 저장 등 브라우저 유틸리티

public/images/
├─ common/       로고, 패비콘 등 공통 이미지
└─ home/         HOME 전용 이미지
```

## 게시판 구성

- `BoardForm`: 작성·수정 공통 상태, 검증, 태그, 임시 저장
- `MarkdownEditor`: 작성 도구 모음과 2열 실시간 미리보기
- `MarkdownPreview`: 작성·수정·상세에서 재사용하는 공통 렌더러
- `MermaidDiagram`: Mermaid를 strict 모드 SVG로 렌더링
- `BoardDetail`과 Article 컴포넌트: 블로그형 상세 화면
- `boardData.js`: 백엔드 미연동 상태의 프론트 샘플 데이터

Markdown의 일반 HTML은 sanitize 처리하며, 접기 UI에 필요한 `details`, `summary`와 제한된 속성만 추가로 허용합니다. `dangerouslySetInnerHTML`은 사용하지 않습니다.

현재 토큰 저장 구현은 `tokenStorage.js`에 격리되어 있으며 Axios 요청 인터셉터가 JWT를 첨부하도록 구성되어 있습니다.
