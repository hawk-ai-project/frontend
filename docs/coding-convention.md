# Coding Convention

- 페이지는 조합과 라우팅에 집중하고 UI와 상태 로직은 도메인 컴포넌트로 분리합니다.
- API 호출은 `src/services`, URL은 `src/constants`에서 관리합니다.
- 브라우저 기능을 사용하는 컴포넌트에만 `'use client'`를 선언합니다.
- `next/link`, `next/image`, App Router를 사용하며 React Router나 직접 DOM 조작은 사용하지 않습니다.
- 작성·수정·상세의 Markdown 출력은 공통 `MarkdownPreview`를 재사용합니다.
- Markdown은 `react-markdown`과 `remark-gfm`으로 렌더링합니다.
- 허용한 HTML도 `rehype-sanitize`를 거치며 `dangerouslySetInnerHTML`을 사용하지 않습니다.
- 외부 링크는 새 탭으로 열고 `rel="noopener noreferrer"`를 적용합니다.
- 사용자 입력 오류는 해당 필드 가까이에 표시하고 첫 오류 필드로 포커스를 이동합니다.
- 임시 성공 응답이나 구현되지 않은 API를 완성 기능처럼 표시하지 않습니다.
- 프론트 샘플 데이터와 실제 서버 데이터를 코드 및 문서에서 명확히 구분합니다.
- 공통 이미지는 `public/images/common`, 화면 전용 이미지는 해당 하위 폴더에서 관리합니다.
