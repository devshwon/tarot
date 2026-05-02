# Toss Tarot — 개발 가이드

이 파일은 매 작업 컨텍스트에 자동 로드된다. 핵심 규칙을 인라인으로 담고,
세부 규약은 필요 시점에만 `prompts/`의 해당 문서를 참조한다.

## 플랫폼 / 빌드 (변경 금지)
- 플랫폼: **Apps in Toss WebView 미니앱** (비게임)
- 스택: React + TypeScript, **Granite 빌드**
- UI: **TDS 필수** (`@toss/tds-mobile`) — `Button`, `Paragraph`, `TextArea` 등
- Granite outdir: `granite.config.ts`의 `outdir`와 빌드 결과물 경로 일치 유지
- 라우팅: `react-router-dom`, 라우트 `/`, `/detail`, `/ask`, `/history`, `/settings`

## 작업 원칙 (모든 작업에 적용)
- **토큰 우선**: spacing/radius/typography는 `src/design/tokens.ts` (`spacingPx`,
  `radiusPx`, `layoutPx`)만 사용. 임의 px(7, 10, 13 등) 하드코딩 금지.
- **TDS 컴포넌트 우선**: 동일 기능이 TDS에 있으면 TDS를 쓴다.
- **상태 4종 분기**: 페이지는 Loading / Empty / Error / Success를 명시적으로
  분기한다. `PageStateView` + `PageState` 타입 사용.
- **최소 구현**: MVP 범위 외 기능/추상화/리팩토링 추가 금지.
- **패킷 단위**: 30~60분 단위로 쪼개고, 코드 작성 전 DoD(완료조건 5개)를 먼저
  정의한다. 템플릿은 `prompts/10-packet.md`.
- **민감정보**: 공유 텍스트에 사용자 질문 원문을 포함하지 않는다.
  `localStorage` 초기화는 `tarot_` prefix 키만 대상으로 한다 (`clearAppData`).
- **카피 톤**: 단정/위험 표현(투자·의료·도박 단정) 금지. 면책 한 문장 +
  "면책 조항은 설정에서 확인할 수 있습니다." 형식 유지.

## 큰 작업 보고 시 출력 형식
- 변경 요약 (3줄)
- 완료조건 체크
- 변경 파일 목록
- 검증 방법
- 리스크 2개 + 다음 단계

## 상황별로 참조할 문서 (필요할 때만 읽기)
- `prompts/00-charter.md` — 프로젝트 헌장 전문 (위 원칙의 원본)
- `prompts/10-packet.md` — 새 패킷 시작 시 DoD 템플릿
- `prompts/03-qa-state-checklist.md` — 라우트별 상태 전환 QA
- `prompts/90-review.md` — 출시 전 리뷰 (운영/기능/디자인/보안)
- `prompts/02-tarot-token-backlog.md` — P0~P2 작업 이력 (참고용)
- `prompts/01-app-console-input-template.md` — Apps in Toss 콘솔 등록 작업 시
- `prompts/95-release-note-and-schemes-template.md` — 릴리스 노트 작성 시
- `prompts/99-last-checklist.md` — 최종 출시 직전 체크
