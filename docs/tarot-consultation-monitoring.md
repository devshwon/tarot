# 타로 상담 — 모니터링 / 운영 가이드

신규 LLM 호출량이 기존(`/ask`)보다 늘어나는 만큼 **비용/한도/장애 신호**를 정기 점검한다.

## 1. OpenAI

### 한도 / 알림 (필수)
1. https://platform.openai.com/account/limits
2. **Hard limit**을 평소 사용량의 1.5~2배로 설정 (도용/버그로 인한 결제 폭탄 방지)
3. **Soft limit + Email alerts**: 50% / 75% / 90% 도달 시 이메일

### Activity 로그
- https://platform.openai.com/logs
- 실패 호출(빨강) 클릭하면 **error.code / message** 본문 확인 가능
- 정기 점검 (월 1회):
  - 시간대 분포에 비정상 스파이크 있는지
  - 모델 분포 (gpt-4o-mini만 사용해야 함)
  - 평균 토큰 / 호출당 비용 추이

## 2. Cloudflare AI Gateway

### 위치
https://dash.cloudflare.com → AI → AI Gateway → **toss-tarot**

### Analytics 탭
점검 항목:
- **요청 수**: 일별 추이
- **평균 지연**: 갑자기 늘면 OpenAI 측 이슈
- **에러율**: 5% 이상이면 조사 필요
- **캐시 적중률** (캐싱 켰을 경우)

### Logs 탭
- 실패 호출의 응답 본문 직접 확인
- `wrangler tail` 대안으로 사용 가능

### 캐싱 (선택, 비용 절감)
같은 질문 반복 시 OpenAI 비용 0으로 만들 수 있음.
- Settings → Cache → 활성화
- 단, 타로의 특성상 같은 질문은 거의 없어서 효과 미미. 굳이 안 켜도 됨.

## 3. Cloudflare Worker

### 통계 (대시보드)
- Workers & Pages → toss-tarot-gpt → Metrics
- **Requests / sec**, **CPU time**, **Errors**

### 실시간 로그
```bash
cd proxy
npx wrangler tail
```
- 실패 시 `upstream_error` 객체 출력 (status + body 일부)
- 평상시는 `POST /v1/chat/completions OK`만 흘러감

### Rate Limit 적정성 (현재 상태)
`wrangler.toml`:
```toml
RATE_PER_MIN = "10"   # 분당 IP당 호출
DAILY_LIMIT = "5000"  # 글로벌 일 한도
```

**검토 포인트**:
- Consult 한 턴당 LLM 호출 1~2회 (1차 + 폴백). 광고 시청까지 합쳐도 한 턴 시작~끝은 1분 이내
- 정상 사용자 → 분당 2~4회 정도. 10/min은 여유
- **재시도 폭주 (광고 실패 → 재시도) 시 최대 ~6회 잡힘**. 그래도 10/min 안에 들어옴
- 이상 사용자(자동화 등) 감지 시 RATE_PER_MIN 5로 낮춰도 OK

**일 한도 5000**:
- 1000명이 5턴씩 = 5000회. 평균 사용자 풀 ≦ 500이면 충분
- 사용자 늘어나면 10000~20000으로 상향 (CF KV 비용은 무시할 수준)

### 변경 방법
```bash
# wrangler.toml [vars]에서 RATE_PER_MIN, DAILY_LIMIT 수정 후
cd proxy && npx wrangler deploy
```

## 4. 사용자 측 에러 신호

### Sentry (아직 미연동)
- `.env`의 `SENTRY_DSN` 설정만 있고 init 코드 없음
- 출시 전 `@sentry/react` 추가하고 init하면 클라이언트 console.error → Sentry로 자동 전송
- 우선순위: 운영 안정화 후 별도 패킷으로 진행

### 임시 방안
- 사용자가 "AI 해석을 가져오지 못했어요" 보고 시 → AI Gateway Logs에서 해당 시간대 호출 추적
- 토스앱 → 사용자가 어떤 카테고리/질문에서 실패했는지 알기 어려움 (개인정보)

## 5. 정기 점검 주기

| 주기 | 체크 항목 |
|---|---|
| 매일 (자동) | OpenAI 사용량 알림 이메일 (50/75/90%) |
| 주 1회 | AI Gateway Analytics — 요청수/지연/에러율 |
| 월 1회 | OpenAI Activity 패턴 — 비정상 호출 / 모델 분포 |
| 사고 시 | wrangler tail + Gateway Logs 즉시 확인 |

## 6. 사고 발생 시 런북

### "AI 해석을 가져오지 못했어요" 다발
1. AI Gateway Analytics → 에러율 확인
2. 5% 이상 → wrangler tail + Logs에서 status / body 확인
3. status 401/403 → AI Gateway Authenticated Gateway 설정 또는 OpenAI 키 상태
4. status 429 → OpenAI rate limit (계정 한도 도달) 또는 워커 RATE_PER_MIN
5. status 500+ → OpenAI 일시 장애. 30분 후 재확인

### 결제 폭탄 의심
1. OpenAI Billing → 즉시 사용량 확인
2. 비정상 호출 → API 키 회전 (`docs/security-api-key.md` 절차)
3. CF Workers → 임시 RATE_PER_MIN을 1로 떨어뜨려 차단 (wrangler.toml + deploy)

### Cloudflare AI Gateway 장애
- Gateway 우회: `wrangler.toml`의 `AI_GATEWAY_BASE = ""`로 비우고 deploy → OpenAI 직접 호출 모드 (지원 콜로 의존)
- 단 `unsupported_country` 위험 다시 노출됨 → 빠른 임시 조치만

## 7. 비용 가늠

가정: 월 1만 회 호출 (= 일 333회)
- gpt-4o-mini: input ~1500 + output ~700 토큰 평균 (직전 1턴 컨텍스트 + JSON 응답)
- 1회당 ≒ $0.0006
- 월 ≒ $6
- AI Gateway 비용 0 (무료 한도 100k req/day 한참 미달)
- CF Workers 비용 0 (무료 100k req/day)

→ **MVP 단계 예상 비용 = OpenAI 기준 월 $5~10 수준**. 사용자 폭증 시 선형 증가.
