# Tarot 앱 토큰 백로그 (헌장 준수)

## 요약 (3줄)
- 현재 초안은 기능은 동작하지만, Toss Look 일관성·카피 품질·상태 설계(Loading/Empty/Error/Success)가 부족하다.
- 본 백로그는 `prompts/00-charter.md`의 Step A~C를 기준으로, 30~60분 패킷 단위로 재정렬했다.
- 우선순위는 `P0(검수 리스크 제거) → P1(핵심 UX 완성) → P2(완성도 향상)` 순으로 진행한다.

## Step A. 1페이지 기획 요약

### 문제 정의
- 오늘의 타로/질문 타로를 가볍게 확인할 수 있으나, 신뢰감 있는 정보 구조와 Toss스러운 UI 톤이 약하다.

### 타깃 사용자
- 출퇴근/쉬는 시간에 1~3분 내 짧은 리추얼을 원하는 Toss 사용자.

### 핵심 가치
- 빠른 1일 1카드 경험
- 부담 없는 질문-응답 경험
- 기록 기반의 반복 사용 동기

### 필수 기능 3개
- 오늘의 카드 공개(1탭 뒤집기) + 상세 해석 잠금 해제 흐름
- 질문 입력 후 카드/조언 반환
- 최근 기록 조회 및 로컬 데이터 관리

### 후순위 기능 3개
- 공유 문구 A/B 개선
- 카드 설명 톤(카피) 다듬기
- 빈 상태/에러 상태 일러스트 강화

### WebView/App-in-Toss 제약
- `@apps-in-toss/web-framework` + Granite 유지
- 비게임 앱으로 TDS 사용 필수
- 외부 서버 의존 없이 로컬 저장소 중심(MVP)
- 공유 API 미지원 환경 대비 클립보드 대체 필수

## Step B. 화면 & 흐름 설계

### 라우트 목록
- `/` 오늘의 카드
- `/detail` 상세 해석
- `/ask` 질문하기
- `/history` 기록
- `/settings` 설정

### 화면 상태 정의
- Home(`/`)
  - Loading: 일일 카드 계산 전 스켈레톤
  - Empty: 카드 데이터 없음(예외)
  - Error: 저장소 접근 실패/공유 실패
  - Success: 카드 공개 + 요약 해석 + CTA
- Detail(`/detail`)
  - Loading: 잠금 상태 조회 중
  - Empty: 카드 없음
  - Error: 잠금/이력 갱신 실패
  - Success: 잠금 전 안내 또는 잠금 후 상세 해석
- Ask(`/ask`)
  - Loading: 카드 계산 중(짧은 인디케이터)
  - Empty: 질문 미입력 상태
  - Error: 입력 검증 실패(공백, 길이 초과)
  - Success: 질문 결과 카드+조언
- History(`/history`)
  - Loading: 기록 로딩
  - Empty: 기록 없음
  - Error: 파싱 실패
  - Success: 최근 14일 목록
- Settings(`/settings`)
  - Loading: 설정 로딩
  - Empty: 해당 없음
  - Error: 데이터 초기화 실패
  - Success: 앱 정보/면책/데이터 관리

### 주요 사용자 플로우
- 플로우 1: 오늘의 카드 확인 → 카드 뒤집기 → 상세 보기(잠금 해제) → 기록 반영
- 플로우 2: 질문 입력 → 카드 뽑기 → 결과 확인 → 질문 재시도
- 플로우 3: 기록 진입 → 최근 카드 조회 → 설정에서 데이터 초기화

## Step C. 구현 계획 (토큰 패킷)

> 기준: 1 토큰 = 30~60분 패킷, 각 패킷 DoD 5개 고정

### P0-01. 토큰 기반 스타일 하드코딩 제거 (2토큰) ✅ 완료
**목표**
- 인라인 스타일/임의 px 값을 `src/design/tokens.ts` 기준으로 정리

**DoD**
- [x] `style={{ marginTop: 12 }}` 등 임의 숫자 사용 위치 식별 완료
- [x] 공통 클래스 또는 토큰 유틸(`spacingPx`, `radiusPx`, `layoutPx`) 적용
- [x] 네비/카드/페이지 간격 체계가 `xxs~xxxxl` 범위로 통일
- [x] 모서리 반경이 `radius` 토큰만 사용하도록 통일 (CSS 변수 보강)
- [x] 시각 변경 전/후 캡처 기준 확인(회귀 없음) — 빌드 통과

**영향 파일**
- `src/design/tokens.ts` (layout.cardWidth, layoutPx 추가)
- `src/index.css` (--spacing-xxs/xxxl/xxxxl, --radius-xs/xxl, --layout-card-*, .card-keyword/.nav-link/.card-emoji/.card-inner 토큰화)
- `src/pages/Home.tsx`, `Detail.tsx`, `Ask.tsx`, `History.tsx`, `Settings.tsx`, `NotFound.tsx`
- `src/components/CardReveal.tsx`

---

### P0-02. 상태 모델 표준화 (Loading/Empty/Error/Success) (2토큰) ✅ 완료
**목표**
- 모든 주요 페이지에 상태 컴포넌트 골격 도입

**DoD**
- [x] Home/Detail/Ask/History/Settings 상태 enum(PageState) 및 명시 분기 도입
- [x] Empty/Error 문구를 각 화면 목적에 맞게 확정
- [x] 로딩 UI 재사용: LoadingSpinner + PageStateView(loading/empty/error)
- [x] 예외 시 재시도/돌아가기 버튼 제공
- [x] 상태별 QA 체크리스트: `prompts/03-qa-state-checklist.md`

**영향 파일**
- `src/types/pageState.ts`, `src/components/LoadingSpinner.tsx`, `src/components/PageStateView.tsx`
- `src/pages/Home.tsx`, `Detail.tsx`, `Ask.tsx`, `History.tsx`, `Settings.tsx`
- `src/index.css` (로딩 스피너 스타일), `prompts/03-qa-state-checklist.md`

---

### P0-03. 하단 탭/아이콘 Toss 톤 정비 (1토큰) ✅ 완료
**목표**
- 이모지 아이콘 중심 탭을 TDS 톤에 맞게 정리

**DoD**
- [x] 탭 active 시 상단 인디케이터(::before, 토큰 간격/반경)로 시각 차이 명확화
- [x] 터치 영역 최소 44px: `--touch-target-min`, `layout.touchTargetMin`, `min-height`/`padding` 토큰 적용
- [x] 라벨 `white-space: nowrap`(.nav-link-label)으로 줄바꿈 제거
- [x] 접근성: 각 링크 `aria-label`, 현재 탭 `aria-current="page"`
- [x] 빌드 통과(라우트 이동 회귀 확인 가능)

**영향 파일**
- `src/components/Layout.tsx`, `src/design/tokens.ts`, `src/index.css`

---

### P1-01. 홈 화면 CTA/카피 재작성 (1토큰) ✅ 완료
**목표**
- 핵심 행동(상세 보기, 공유)의 문구/우선순위 개선

**DoD**
- [x] 공개 전: "카드를 탭해 오늘의 메시지를 확인하세요." / 공개 후: 상세 보기·공유 CTA
- [x] 잠금 문구: "광고 보고 상세 해석" → "잠금 해제하고 상세 보기"
- [x] 공유 성공: "공유되었습니다" 또는 "클립보드에 복사되었습니다" / 실패: "공유에 실패했습니다…" vs "클립보드에 복사되지 않았습니다…" 분리
- [x] 면책: 한 문장("오락 목적이며, 결정의 근거로 사용할 수 없습니다.") + "면책 조항은 설정에서 확인할 수 있습니다."
- [x] 버튼 순서·역할: Primary 상세 보기, Weak 공유 유지

**영향 파일**
- `src/pages/Home.tsx`

---

### P1-02. 상세 해석 잠금 해제 흐름 정리 (1토큰) ✅ 완료
**목표**
- `/detail` 잠금 화면과 해제 후 화면의 정보 구조 통일

**DoD**
- [x] 잠금 화면 3단: 이유(잠금 안내) → 행동(잠금 해제하고 보기) → 복귀(홈으로 돌아가기), 카피 정리
- [x] 해제 후 순서 고정: 카드 정보 → 상세 해석 → 오늘의 조언 → 행운 정보 (주석으로 명시)
- [x] useDailyCard.unlock()에서 saveToHistory(…, unlocked: true) 호출로 즉시 반영
- [x] 돌아가기: goHome = () => navigate('/')로 잠금/해제 공통 사용
- [x] 면책: 홈과 동일 한 문장 + "설정에서 확인할 수 있습니다"

**영향 파일**
- `src/pages/Detail.tsx` (hooks 변경 없음)

---

### P1-03. 질문하기 입력 검증 강화 (1토큰) ✅ 완료
**목표**
- 질문 입력 품질과 결과 재시도 흐름 개선

**DoD**
- [x] 공백 trim + 연속 공백 하나로 정규화(normalizeQuestion), 최소 2자 검증
- [x] 최대 100자 시 "최대 글자 수에 도달했습니다" 노출, 글자 수 "n/100자" 표시
- [x] 제출 버튼: canSubmit = normalized.length >= 2 && !isSubmitting, placeholder에 "(2자 이상)" 안내
- [x] 결과 화면: 질문(region) → 카드 해석(region, 뽑은 카드 + 해석/조언) 계층 분리, 라벨 "질문" / "해석"
- [x] handleReset 시 question·result·isSubmitting 모두 초기화

**영향 파일**
- `src/pages/Ask.tsx`

---

### P1-04. 기록 화면 정보 밀도 개선 (1토큰) ✅ 완료
**목표**
- 기록 리스트의 날짜/상태 인지성 강화

**DoD**
- [x] 날짜: formatHistoryDate(오늘/어제/M월 d일, date-fns + ko locale), storage에서 export
- [x] 잠금 해제 뱃지: .history-badge-unlocked 통일(상세 확인, 토큰 기반 pill)
- [x] 빈 상태: PageStateView empty에 "오늘의 카드 보러가기" 버튼 이미 제공
- [x] 14일: MAX_HISTORY_DAYS 상수로 저장/표시 일치(slice + "최근 N일간의 카드 기록")
- [x] 최대 14개 항목이라 가상화 없이 단순 리스트 유지

**영향 파일**
- `src/pages/History.tsx`, `src/utils/storage.ts`, `src/index.css`

---

### P1-05. 설정 화면 데이터 초기화 안정화 (1토큰) ✅ 완료
**목표**
- `localStorage.clear()` 범위 과다 문제 방지

**DoD**
- [x] storage.clearAppData(): STORAGE_KEYS_PREFIX('tarot_') 일치 키만 삭제, Settings에서 호출
- [x] 초기화 성공 시 토스트 "데이터가 초기화되었습니다" + hash '#/' + reload로 홈 복귀
- [x] 다이얼로그: "기록과 잠금 정보가 삭제됩니다. 진행할까요?" / 확인 "초기화", 취소 "취소"
- [x] 면책 한 문단으로 통합, 데이터 관리 문구 간소화(중복 제거)
- [x] error 시 "다시 시도"·"설정으로"로 복귀

**영향 파일**
- `src/pages/Settings.tsx`, `src/utils/storage.ts`

---

### P2-01. 타로 데이터 카피 톤 일관화 (2토큰) ✅ 완료
**목표**
- 카드 해석/조언 문체를 일관되고 안전하게 정리

**DoD**
- [x] 단정/위험 표현 제거: 가이드라인 명시(투자·건강·도박 금지), "가장 긍정적인" 등 완급 완화
- [x] shortReading·detailedReading 톤 일치: ~할 수 있습니다 / ~해 보세요 등 암시형으로 통일
- [x] 조언 상한: MAX_ADVICE_LENGTH=60, 연인 등 두 문장 조언은 한 문장으로 정리
- [x] name(영문)·nameKo(한글) 규칙 주석으로 명시
- [x] 면책과 충돌 없음 검수(결정·의료·투자 단정 없음)

**영향 파일**
- `src/utils/tarotData.ts`

---

### P2-02. 공유/복사 경험 고도화 (1토큰) ✅ 완료
**목표**
- 공유 실패 상황에서도 사용자 경험 유지

**DoD**
- [x] canUseNativeShare()·shareText() 공통 유틸(src/utils/share.ts), Home에서 사용
- [x] 성공 시 share/clipboard별 메시지, 실패 시 SHARE_MESSAGES.failShare/failCopy 분리
- [x] buildDailyCardShareText·SHARE_DAILY_TEMPLATE로 템플릿 단일 관리
- [x] 주석으로 "공유 텍스트에 질문 원문 미포함" 정책 명시(개인정보)
- [x] WebView 미지원 시 클립보드 폴백 필수로 JSDoc 명시

**영향 파일**
- `src/utils/share.ts`, `src/pages/Home.tsx`

---

### P2-03. 테스트/검증 최소 세트 추가 (2토큰) ✅ 완료
**목표**
- 핵심 시나리오 회귀를 빠르게 확인 가능하게 구성

**DoD**
- [x] 일일 카드: getDailyCard(date) 동일 날짜 → 동일 카드, 다른 날짜 → (보통) 다른 카드
- [x] 질문 카드: getQuestionCard(q, date) 동일 날짜·질문 → 동일 카드(dailyCard에 dateStr 옵션 추가)
- [x] 저장소: getHistory/saveToHistory/clearAppData/isUnlockedToday/unlockToday, MAX_HISTORY_DAYS/STORAGE_KEYS_PREFIX
- [x] 스모크: App 컴포넌트 존재 검사 + README에 수동 플로우 3종(홈/질문하기/기록) 정의
- [x] README "테스트 및 검증": npm run test, 실패 시 확인 사항, 수동 스모크 절차

**영향 파일**
- `vitest.config.ts`, `src/utils/dailyCard.ts`(dateStr 옵션), `src/utils/dailyCard.test.ts`, `src/utils/storage.test.ts`, `src/pages/smoke.test.tsx`, `README.md`

---

### P2-04. 광고 재시도 사용자 안내 토스트 (1토큰)
**목표**
- `failedToShow` 자동 재시도가 무음이라 어색한 UX를 보완

**DoD**
- [ ] `tryShowAd` 재시도 분기에서 토스트/스낵바 노출 ("광고 불러오기 실패, 다시 시도 중…" 류)
- [ ] 마지막 재시도까지 실패해 우회 노출(`reveal()`)로 빠질 때도 안내 토스트 노출
- [ ] 토스트는 광고 SDK 오버레이와 겹치지 않는 위치에 표시 (z-index/타이밍 검토)
- [ ] 사용자가 광고 화면을 명시적으로 X로 닫은 케이스(`onDismiss`)에는 안내 노출 안 함
- [ ] 토스/TDS 토스트 컴포넌트 사용 (자체 컴포넌트 추가 금지)

**영향 파일**
- `src/pages/Ask.tsx`, `src/pages/Detail.tsx`
- (선택) `src/components/Toast.tsx` 또는 TDS 토스트 헬퍼

---

### P2-05. 광고 이벤트 텔레메트리 (1토큰)
**목표**
- 광고 노출/시청/실패 비율을 운영 대시보드에서 가시화하여 정책(재시도 횟수, backoff 등) 조정 근거 확보

**DoD**
- [ ] `adService.showRewardedAd` 내부에서 `userEarnedReward`/`dismissed`/`failedToShow`/`onError` 이벤트마다 카운터 또는 로그 전송
- [ ] 전송 채널 결정: (a) Cloudflare Workers 프록시에 이벤트 엔드포인트 추가, (b) 외부 분석 도구 사용
- [ ] 호출자 컨텍스트(어느 화면에서 발생했는지) 포함: 'ask' / 'detail'
- [ ] 운영 환경에서만 전송, 개발 환경(`import.meta.env.DEV`)에서는 콘솔 로그만
- [ ] 이벤트 전송 실패가 광고/앱 동작에 영향 주지 않음 (fire-and-forget)

**영향 파일**
- `src/services/adService.ts`
- (선택) `proxy/src/index.ts` (이벤트 수집 엔드포인트)

---

## 완료조건 체크리스트
- [ ] 모든 패킷이 30~60분 단위로 분해되어 있다.
- [ ] 각 패킷마다 DoD 5개가 정의되어 있다.
- [ ] TDS/Granite/WebView 제약을 위반하는 항목이 없다.
- [ ] Toss Look 토큰(`src/design/tokens.ts`) 기준이 반영되어 있다.
- [ ] P0→P1→P2 순서로 실행 우선순위가 명확하다.

## 검증 방법
- 패킷 단위로 `lint` + 주요 라우트 수동 점검
- 상태(Loading/Empty/Error/Success) 전환 스크린 체크
- 데이터 초기화/공유/히스토리 회귀 체크

## 리스크 2개 + 다음 패킷 제안
- 리스크 1: 광고 연동이 실제 SDK 없이 모의 unlock 로직이라, 정책 검수 시 추가 수정 가능성
- 리스크 2: 기존 인라인 스타일가 많아 토큰 치환 중 UI 회귀 가능성
- 다음 패킷 제안: `P0-01`부터 시작해 스타일 토큰화 완료 후 `P0-02` 상태 모델 표준화 진행
