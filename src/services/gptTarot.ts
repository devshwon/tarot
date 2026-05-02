/**
 * GPT 연동: 타로 카드 AI 해석.
 * 클라이언트는 OpenAI 를 직접 호출하지 않는다. 항상 프록시(VITE_GPT_PROXY)를 경유한다.
 * 키는 프록시 서버의 secret 에만 보관한다 (본 레포의 proxy/ — Cloudflare Workers).
 */
import type { TarotCard } from '@/types/tarot';

const GPT_PROXY_BASE = (import.meta.env.VITE_GPT_PROXY ?? '').replace(/\/$/, '');
const BASE_URL = GPT_PROXY_BASE ? `${GPT_PROXY_BASE}/v1/chat/completions` : '';

const SERVICE_UNAVAILABLE_MESSAGE =
  'AI 해석을 일시적으로 사용할 수 없어요. 네트워크를 확인하거나 잠시 후 다시 시도해 주세요.';

/** OpenAI Chat Completions에서 일반적으로 사용하는 경제 모델(환경변수 미설정 시 기본). */
const DEFAULT_GPT_MODEL = 'gpt-4o-mini';

/**
 * 질문이 있을 때 GPT에 전달되는 user 메시지 구성:
 * 질문을 가장 위에 두고, 카드 정보는 "참고 자료"로 뒤에 배치한다.
 * 이렇게 하면 모델이 카드 설명을 늘어놓는 대신 질문에 답하는 형태로 출력한다.
 */
function buildPrompt(card: TarotCard, question?: string): string {
  const hasQuestion = !!(question && question.trim());

  if (hasQuestion) {
    return [
      `[사용자 질문]`,
      question!.trim(),
      ``,
      `[참고할 카드]`,
      `- 이름: ${card.nameKo} (${card.name})`,
      `- 키워드: ${card.keywords.join(', ')}`,
      `- 카드 한 줄 의미: ${card.shortReading}`,
      `- 카드의 상징(참고용, 그대로 옮기지 말 것): ${card.detailedReading}`,
      ``,
      `요청: 위 카드의 상징을 사용자 질문에 연결해, 질문에 **직접 답하는 형식**으로 작성하세요.`,
      `- 먼저 질문 주제(연애/진로/학업/결정/인간관계/건강 등)를 파악하고 그 맥락에 맞춰 답하세요.`,
      `- 카드 일반론만 늘어놓거나, 입력된 '한 줄 의미/상징' 문장을 그대로 옮기지 마세요.`,
      `- 단정 표현·공포 유발·의료/투자/도박/법률 단정 금지.`,
    ].join('\n');
  }

  return [
    `[뽑은 카드]`,
    `- 이름: ${card.nameKo} (${card.name})`,
    `- 키워드: ${card.keywords.join(', ')}`,
    `- 카드 한 줄 의미: ${card.shortReading}`,
    `- 카드의 상징(참고용, 그대로 옮기지 말 것): ${card.detailedReading}`,
    ``,
    `요청: 위 카드를 바탕으로 오늘 하루를 위한 짧은 타로 메시지를 작성하세요. 입력된 문장을 그대로 옮기지 말고 친근한 톤으로 재해석하세요. 단정/공포/의료·투자·도박 단정 금지.`,
  ].join('\n');
}

export const GptTarotService = {
  /** 프록시 설정 여부 */
  isConfigured(): boolean {
    return !!GPT_PROXY_BASE;
  },

  /**
   * 타로 카드에 대한 GPT 해석 요청.
   * @param card 뽑은 카드
   * @param question 선택: 사용자 질문(질문하기 플로우에서 전달)
   * @param signal 선택: 호출자에서 요청을 취소하기 위한 AbortSignal
   * @returns 해석 텍스트 또는 서비스 불가 메시지
   * @throws DOMException(AbortError) signal이 abort된 경우 호출자가 처리하도록 그대로 던진다
   */
  async getTarotInterpretation(card: TarotCard, question?: string, signal?: AbortSignal): Promise<string> {
    try {
      if (!GPT_PROXY_BASE) {
        return SERVICE_UNAVAILABLE_MESSAGE;
      }

      const model: string = import.meta.env.VITE_GPT_MODEL?.trim() || DEFAULT_GPT_MODEL;

      const systemContent = `당신은 한국어로 답하는 타로 상담사입니다. 이 작업의 목적은 **사용자의 구체적 질문에 카드의 상징을 빌려 직접 답하는 것**이며, 카드의 일반적 설명을 늘어놓는 것이 아닙니다.

[작성 규칙]
1. 질문 주제(연애/진로/학업/결정/인간관계/건강/금전 등)를 먼저 파악하고, 답변 전체를 그 맥락에 고정하세요. 질문 도메인과 무관한 일반론 금지.
2. 카드 키워드를 질문 상황과 **연결**해서 풀어 쓰세요. (예: "선택" → "지금 결정해야 할 두 갈래 길에서…")
3. 입력으로 받은 '한 줄 의미/상징' 문장을 그대로 옮기거나 재진술하지 말고, 질문 맥락으로 재해석하세요.
4. **톤은 가능성·암시형으로 유지하세요. 미래 단정 금지.**
   - 좋은 예: "~할 수 있어요", "~해 보세요", "~한 흐름이 보여요"
   - 나쁜 예: "결과는 좋습니다", "꼭 ~할 거예요", "~할 가능성이 높아 보입니다", "긍정적인 방향으로 나올 것입니다"
5. **문단 간 내용 반복 금지.** 같은 키워드(예: "선택과 조화")를 두 문단의 메인 소재로 다루지 마세요. 각 문단은 서로 다른 각도여야 합니다.
6. 의료·투자·도박·법률 영역의 구체 결정은 권하지 마세요(필요 시 자연스럽게 환기).

[출력 형식 — 각 문단의 역할이 명확히 다릅니다]
- 한국어, **정확히 3문단**, 총 6~10문장. 머리글/번호/마크다운 없이 자연스러운 문장.
- **1문단(질문에 대한 답)**: 카드 키워드 1~2개를 질문 맥락에 연결해, 질문에 대한 가능성·암시형 답을 줍니다. 카드의 일반 설명을 넣지 마세요.
- **2문단(지금 상황 풀이)**: 사용자가 지금 처한 상황의 흐름·심리·관계 역학 중 **한 측면**을 카드 상징으로 짚어 줍니다. 1문단에서 한 말을 반복하지 마세요.
- **3문단(오늘/이번 주에 할 수 있는 구체 행동 1~2개)**: 질문 도메인에 맞춘 **관찰 가능한 행동**을 제시하세요. "긍정적인 마음가짐을 가지세요", "자부심을 가지세요" 같은 추상 조언 금지. 좋은 예 — 면접: "답변을 노트에 복기해 보세요"; 연애: "오늘 안부 한 줄을 보내 보세요"; 결정: "두 선택지의 장단점을 한 줄씩 적어 보세요"; 학업: "오늘 30분만 집중해 가장 어려운 부분을 풀어 보세요".`;

      const userContent = buildPrompt(card, question);

      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system' as const, content: systemContent },
            { role: 'user' as const, content: userContent },
          ],
          max_tokens: 800,
          temperature: 0.7,
        }),
        signal,
      });

      if (!response.ok) {
        const bodyText = await response.text();
        console.error('[GptTarotService] HTTP 오류:', response.status, bodyText);
        return SERVICE_UNAVAILABLE_MESSAGE;
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (typeof content !== 'string') {
        return SERVICE_UNAVAILABLE_MESSAGE;
      }
      return content.trim();
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        throw e;
      }
      console.error('[GptTarotService] 오류:', e);
      return SERVICE_UNAVAILABLE_MESSAGE;
    }
  },
};
