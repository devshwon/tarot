## 시작시 아래 명령어를 입력하고 시작

이 프로젝트는 prompts/00-charter.md를 프로젝트 헌장으로 사용한다.
이 문서를 기준으로 이후 모든 작업을 진행해.
지금부터는 아이디어/컨셉 입력을 기다려.

## MCP 구성 및 설치 가이드

이 저장소는 Cursor MCP 서버를 `ax`로 실행하도록 설정돼 있다. Windows 환경에서 아래 순서로 설치 및 구동한다.

### 1) 필수 도구 설치
- PowerShell을 관리자 권한으로 실행 후 Scoop 설치:
  - `iwr -useb get.scoop.sh | iex`
- Scoop 버전 확인: `scoop --version`
- Toss 버킷 추가: `scoop bucket add toss https://github.com/toss/scoop-bucket.git`
- `ax` 설치: `scoop install ax`

### 2) MCP 실행 설정
- MCP 설정 파일: `.cursor/mcp.json`
- 현재 설정 예시:
  - `"command": "C:\\Users\\Ha\\scoop\\shims\\ax.exe"`
  - `"args": ["mcp", "start"]`
- Scoop 경로가 다르면 `command` 값을 본인 환경의 `ax.exe` 전체 경로로 수정한다.

### 3) 구동 방법
- Cursor를 완전히 종료 후 재시작하면 MCP 서버가 자동으로 뜬다.
- 실행 오류(ENOENT 등)가 나면:
  - `ax` 전체 경로를 `.cursor/mcp.json`에 다시 지정
  - PowerShell에서 `ax version`으로 동작 확인
  - Cursor를 재시작

## 프로젝트 사용법 (요약)
- 프로젝트 헌장은 `prompts/00-charter.md`를 따른다.
- 예제 앱/서버는 `apps-in-toss-examples/` 아래에 있다. 각 예제 폴더의 README.md를 참고해 `yarn install`, `yarn dev` 등을 실행한다.

## 테스트 및 검증

### 자동 테스트 실행
```bash
npm run test
```
- 일일 카드/질문 카드 결정성, 저장소 입출력·초기화, App 컴포넌트 스모크를 실행한다.
- 감시 모드: `npm run test:watch`

### 실패 시 확인 사항
- **경로/alias**: `vitest.config.ts`의 `resolve.alias`가 `@/` → `src/` 인지 확인.
- **환경**: Node 18+ 권장. `happy-dom`으로 DOM·localStorage 사용.
- **일일/질문 카드 테스트 실패**: `getDailyCard(dateStr)`, `getQuestionCard(question, dateStr)` 시그니처와 `tarotData` 카드 수 확인.
- **저장소 테스트 실패**: `clearAppData()` 후 다른 테스트가 `tarot_` 키를 쓰지 않는지 확인.

### 수동 스모크 플로우 (3종)
TDS/Apps in Toss 브리지가 필요한 화면은 자동 테스트에서 제외되며, 아래를 수동으로 점검한다.

1. **홈(오늘의 카드)**  
   앱 실행 → 홈에서 로딩 후 카드 표시 → 카드 탭하여 뒤집기 → 요약·상세 보기/공유 동작 확인.

2. **질문하기**  
   질문 입력(2자 이상) → 카드 뽑기 → 결과 카드·해석·조언 표시 → "다른 질문하기" 후 폼 초기화 확인.

3. **기록**  
   기록 탭 진입 → 빈 상태 또는 최근 14일 목록 표시 → 날짜 포맷(오늘/어제/M월 d일)·잠금 해제 뱃지 확인.

## AI 타로 해석 (GPT 연동)

상세 해석 화면과 질문하기 결과에서 **「AI로 더 해석해 보기」** 버튼으로 GPT 기반 해석을 요청할 수 있다.

### 설정 방법
1. 프로젝트 루트에 `.env` 파일을 만들고 `.env.example`을 참고해 다음 중 하나를 설정한다.
   - **OpenAI 직접**: `VITE_OPENAI_API_KEY=sk-...`
   - **또는** `VITE_GPT_API_KEY=sk-...`
   - **프록시 사용 시**: `VITE_GPT_PROXY=https://your-proxy.example.com` (엔드포인트는 `/v1/chat/completions`로 전달)
2. (선택) 사용할 모델: `VITE_GPT_MODEL=gpt-4o-mini` (기본값)
3. 개발 서버 재시작 후, 상세 해석 또는 질문하기 결과 화면에서 버튼이 보이면 사용 가능하다.

API 키/프록시가 없으면 해당 버튼은 노출되지 않는다. 참고: `apps-in-toss-examples/gpt` 예제와 동일한 방식(OpenAI Chat Completions API)을 사용한다.
