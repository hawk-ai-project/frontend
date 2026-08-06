# Branch Strategy

`develop`에서 작업 목적에 맞는 브랜치를 생성합니다.

```text
feature/auth
feature/home
feature/board
feature/layout
docs/project
fix/*
refactor/*
```

현재 미구현 상태인 현장점검·점검이력·통계분석은 구현 범위가 확정된 뒤 별도 feature 브랜치를 생성합니다. `main` 직접 push는 금지합니다.

공통 파일(`package.json`, `src/app/layout.js`, `src/app/globals.css`, `Header.jsx`, `Footer.jsx`, `apiClient.js`)은 담당자를 정하고 변경 전에 팀에 공유합니다. 백엔드 공통 파일은 별도 FastAPI 저장소의 규칙을 따릅니다.

커밋 예:

```text
Feat: 게시판 Markdown 도구 모음 추가
Fix: 로그인 토큰 처리 오류 수정
Docs: 프로젝트 상태 문서 최신화
```
