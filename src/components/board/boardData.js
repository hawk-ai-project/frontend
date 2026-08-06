// 상세 화면까지 확인할 수 있도록 프론트엔드에서만 사용하는 샘플 게시글입니다.
export const prototypeBoards = [
  {
    id: 129,
    isNotice: true,
    category: "프로젝트 공지",
    title: "Hawk-AI 현장 점검 운영 안내",
    summary: "점검 이력 저장 및 처리 상태 기준을 안내합니다.",
    authorName: "관리자",
    author: { name: "관리자", role: "운영" },
    createdAt: "2026-08-06T09:00:00",
    updatedAt: null,
    viewCount: 204,
    date: "08.06",
    tags: ["Hawk-AI", "운영 안내"],
    canEdit: false,
    content: `## 운영 기준

Hawk-AI 현장 점검 시 확인해야 할 **기본 운영 기준**을 안내합니다.

- 탐지 위치와 시간을 확인해 주세요.
- 처리 상태를 점검 기록에 남겨 주세요.
- 개인정보가 포함된 이미지는 등록하지 마세요.

> 현재 게시판 데이터는 화면 확인을 위한 프론트엔드 샘플입니다.`,
  },
  {
    id: 128,
    category: "개발 기록",
    title: "Hawk-AI 프론트엔드를 Next.js App Router로 전환한 과정",
    summary:
      "기존 Vite 구조를 Next.js App Router로 전환하면서 변경한 폴더 구조와 주요 작업 내용을 정리했습니다.",
    authorName: "김도하",
    author: { name: "김도하", role: "Community · LLM · UX" },
    createdAt: "2026-08-06T10:30:00",
    updatedAt: "2026-08-06T11:10:00",
    viewCount: 128,
    date: "08.06",
    tags: ["Next.js", "FastAPI", "Hawk-AI", "프로젝트"],
    canEdit: false,
    content: `## 변경 배경

기존 프로젝트는 **Vite + React Router** 구조로 구성되어 있었습니다. 프론트엔드 라우팅과 공통 레이아웃을 일관되게 관리하기 위해 Next.js App Router로 전환했습니다.

## 주요 변경 내용

- [x] Next.js App Router 전환
- [x] 공통 Header와 Footer 구성
- [x] 게시판 Markdown 작성 기능 추가
- [ ] FastAPI 게시판 API 연동

> 프론트엔드와 백엔드의 역할을 명확하게 분리하고, 현재 화면에서는 서버 저장 성공을 가정하지 않습니다.

## 현재 기술 스택

| 구분 | 기술 | 포트 |
|---|---|---:|
| Frontend | Next.js 16 | 3000 |
| Backend | FastAPI | 8000 |
| Database | MySQL | 3306 |

### 실행 구조

\`\`\`text
Next.js : 3000
FastAPI : 8000
MySQL   : 3306
\`\`\`

자세한 프로젝트 정보는 [Hawk-AI GitHub Organization](https://github.com/hawk-ai-project)에서 확인할 수 있습니다.

---

앞으로 게시판 CRUD API가 준비되면 현재 프론트엔드 데이터 구조를 FastAPI 응답에 연결할 예정입니다.`,
  },
  {
    id: 127,
    category: "점검 결과",
    title: "을왕리 방파제 로프 폐기물 확인",
    summary: "현장 재점검이 필요한 구간과 확인 사항을 공유합니다.",
    authorName: "이점검",
    author: { name: "이점검", role: "현장 점검" },
    createdAt: "2026-08-04T14:20:00",
    updatedAt: null,
    viewCount: 76,
    date: "08.04",
    tags: ["현장점검", "을왕리"],
    canEdit: false,
    content: `## 확인 결과

을왕리 방파제 인근에서 로프 폐기물이 확인되어 현장 재점검이 필요합니다.

- 위치: 방파제 동측
- 상태: 재점검 필요
- 우선순위: 보통`,
  },
  {
    id: 126,
    category: "점검 결과",
    title: "협재 해수욕장 처리 완료 보고",
    summary: "수거 완료 내역과 현장 상태를 공유합니다.",
    authorName: "박관리",
    author: { name: "박관리", role: "현장 관리" },
    createdAt: "2026-08-03T16:40:00",
    updatedAt: null,
    viewCount: 91,
    date: "08.03",
    tags: ["수거완료", "협재"],
    canEdit: false,
    content: `## 처리 결과

협재 해수욕장에서 탐지된 폐기물 수거를 완료했습니다.

**처리 상태:** 완료`,
  },
];
