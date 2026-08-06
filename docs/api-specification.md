# API Specification

Base URL: `http://localhost:8000/api`

이 문서는 FastAPI 연동 시 사용할 프론트엔드 기준의 예정 계약입니다. 현재 작업 공간에는 백엔드 저장소가 없어 실제 구현 상태를 확인하지 못했습니다.

## Auth

- `POST /auth/signup`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/logout`

로그인 성공 응답은 `accessToken`과 `user { id, name, email, role }`을 포함하는 형태를 가정합니다. Bearer 토큰은 Axios 요청 인터셉터가 첨부합니다.

## Boards

- `GET /boards?page=1&pageSize=10&keyword=`
- `GET /boards/:id`
- `POST /boards`
- `PATCH /boards/:id`
- `DELETE /boards/:id`

예정 게시글 필드:

```text
id, category, title, summary, content, tags,
author, createdAt, updatedAt, viewCount, thumbnailUrl
```

목록 응답은 `{ items, page, pageSize, totalItems, totalPages }` 형태를 가정합니다. 쓰기·수정·삭제 권한은 백엔드가 최종 검증해야 합니다.

## 현재 프론트엔드 연동 상태

- 게시판 목록만 FastAPI 호출을 시도하며 실패하면 샘플 데이터를 유지
- 상세 화면은 프론트 샘플 데이터 사용
- 작성·수정은 API를 호출하지 않고 미연동 안내만 표시
- 브라우저 임시 저장은 게시글 데이터가 아니며 서버로 전송하지 않음
- 현장점검, 탐지, 이력, 통계는 관련 페이지가 없어 API를 호출하지 않음
