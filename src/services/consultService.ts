/**
 * 타로 상담 — 한 턴당 LLM 1회 호출.
 * 응답: 카드별 의미 + 종합 해석 + 다음 추천 질문 2~3개 (JSON).
 * 직전 1턴(질문/답변 요약/카드명)만 컨텍스트로 전달한다.
 * 호출은 항상 프록시 경유. 키는 프록시 secret 에만 보관.
 */
import type { TarotCard } from '@/types/tarot';
import type { Category } from '@/types/consult';

const GPT_PROXY_BASE = (import.meta.env.VITE_GPT_PROXY ?? '').replace(/\/$/, '');
const BASE_URL = GPT_PROXY_BASE ? `${GPT_PROXY_BASE}/v1/chat/completions` : '';
const DEFAULT_GPT_MODEL = 'gpt-4o-mini';

const SERVICE_UNAVAILABLE_MESSAGE =
  'AI 해석을 일시적으로 사용할 수 없어요. 네트워크를 확인하거나 잠시 후 다시 시도해 주세요.';

export interface ConsultPickedCard {
  position: string;
  card: TarotCard;
}

export interface ConsultPreviousTurn {
  question: string;
  summary: string;
  cardSummary: string;
}

export interface ConsultTurnInput {
  category: Category;
  question: string;
  picks: ConsultPickedCard[];
  previousTurn?: ConsultPreviousTurn;
  signal?: AbortSignal;
}

export interface ConsultCardMeaning {
  position: string;
  cardName: string;
  meaning: string;
}

export interface ConsultTurnResult {
  cardMeanings: ConsultCardMeaning[];
  summary: string;
  nextQuestions: string[];
}

export type ConsultErrorKind = 'config' | 'network' | 'http' | 'parse';

export class ConsultServiceError extends Error {
  readonly kind: ConsultErrorKind;
  constructor(message: string, kind: ConsultErrorKind = 'http') {
    super(message);
    this.name = 'ConsultServiceError';
    this.kind = kind;
  }
}

function categoryGuard(category: Category): string {
  if (category.id === 'money') {
    return '\n[이 카테고리 추가 가드 — 금전·재물]\n- 종목/코인/부동산 매수·매도 추천 금지. 구체 종목명·금액 단정 금지.\n- "수익이 납니다" / "오릅니다" / "떨어집니다" 같은 결과 단정 금지.\n- "흐름이 ~한 신호로 보여요", "조심스럽게 살펴볼 만한 결" 톤만.';
  }
  if (category.id === 'career') {
    return '\n[이 카테고리 추가 가드 — 진로·시험]\n- "합격합니다" / "떨어집니다" / "꼭 됩니다" 같은 결과 단정 금지.\n- "준비한 흐름이 ~한 결로 보여요", "지금 시기에 어울리는 방향이 ~" 톤만.';
  }
  if (category.id === 'love') {
    return '\n[이 카테고리 추가 가드 — 연애·관계]\n- 상대방의 마음을 사실로 단정하지 말고 "그 사람 마음에 ~한 결이 비쳐요" 톤으로.\n- 폭력/통제/감시를 정당화하는 표현 금지. 건강한 거리감을 안내하세요.';
  }
  if (category.id === 'social') {
    return '\n[이 카테고리 추가 가드 — 인간관계]\n- 특정 인물에 대한 단정·비난 금지. "관계의 흐름·역학"으로 풀어쓰세요.';
  }
  if (category.id === 'choice') {
    return '\n[이 카테고리 추가 가드 — 선택·미래]\n- "A를 고르세요" 같은 강한 명령형 금지. 두 길의 결과 단정 금지. "각 길에 비치는 결을 비추는" 톤으로.';
  }
  return '';
}

function buildSystem(category: Category): string {
  return [
    '당신은 한국어로 답하는 타로 상담사입니다.',
    `이번 상담 카테고리는 "${category.label}"입니다. ${category.hint}`,
    categoryGuard(category),
    '',
    '[작성 규칙]',
    '1. 사용자의 질문에 카드들의 상징을 빌려 직접 답하세요. 카드 일반론을 늘어놓지 마세요.',
    '2. 톤은 가능성·암시형. 미래 단정 금지. ("~할 수 있어요", "~한 흐름이 보여요")',
    '3. 합격/수익/완치 같은 단정 표현 금지. 의료·투자·도박·법률 영역의 구체 결정 권고 금지.',
    '4. 공포 유발·불안 자극 금지. 무거운 카드도 해방·전환·정리의 가능성으로 부드럽게.',
    '5. 직전 턴이 주어지면 그 흐름을 한 줄 정도 자연스럽게 이어주되, 새 질문에 답하는 게 우선입니다.',
    '6. 같은 키워드를 카드별 의미와 종합 해석에서 반복 나열하지 마세요. 각 단락은 다른 각도여야 합니다.',
    '',
    '[출력 형식]',
    '아래 JSON 스키마만 반환하세요. 마크다운/머리글/코드펜스/추가 텍스트 금지.',
    '{',
    '  "cardMeanings": [',
    '    {"position": "<위치>", "cardName": "<카드의 한국어 이름>", "meaning": "<2~3문장: 이 위치에서 이 카드가 질문 맥락에서 갖는 의미>"}',
    '  ],',
    '  "summary": "<카드들을 종합해 사용자 질문에 답하는 4~6문장의 한 단락>",',
    '  "nextQuestions": ["<follow-up 1>", "<follow-up 2>", "<follow-up 3 (선택)>"]',
    '}',
    '',
    'cardMeanings는 입력으로 받은 [뽑힌 카드] 순서/위치/이름을 그대로 따르세요.',
    'nextQuestions는 2~3개. 사용자가 방금 한 질문 + 받은 답에서 자연스럽게 이어질 만한 같은 카테고리 안의 질문들로, 30자 이내, 구체적으로.',
  ].join('\n');
}

function buildUser(input: ConsultTurnInput): string {
  const lines: string[] = [];
  if (input.previousTurn) {
    lines.push('[직전 턴 요약]');
    lines.push(`- 직전 질문: ${input.previousTurn.question}`);
    lines.push(`- 직전 답변 요약: ${input.previousTurn.summary}`);
    lines.push(`- 직전 카드: ${input.previousTurn.cardSummary}`);
    lines.push('');
  }
  lines.push('[이번 질문]');
  lines.push(input.question);
  lines.push('');
  lines.push('[뽑힌 카드]');
  for (const p of input.picks) {
    lines.push(
      `- 위치: ${p.position} / 카드: ${p.card.nameKo} (${p.card.name}) / 키워드: ${p.card.keywords.join(', ')} / 한 줄 의미: ${p.card.shortReading}`
    );
  }
  lines.push('');
  lines.push('위 정보를 바탕으로 system 메시지에 명시된 JSON 형식만으로 응답하세요.');
  return lines.join('\n');
}

function safeParseJson(text: string): unknown {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```$/i, '')
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

function normalizeResult(
  raw: unknown,
  picks: ConsultPickedCard[]
): ConsultTurnResult | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;

  const cardMeaningsRaw = Array.isArray(r.cardMeanings) ? (r.cardMeanings as unknown[]) : [];
  const cardMeanings: ConsultCardMeaning[] = cardMeaningsRaw
    .map((m): ConsultCardMeaning | null => {
      if (!m || typeof m !== 'object') return null;
      const mm = m as Record<string, unknown>;
      const position = typeof mm.position === 'string' ? mm.position : '';
      const cardName = typeof mm.cardName === 'string' ? mm.cardName : '';
      const meaning = typeof mm.meaning === 'string' ? mm.meaning.trim() : '';
      if (!meaning) return null;
      return { position, cardName, meaning };
    })
    .filter((x): x is ConsultCardMeaning => x !== null);

  const summary = typeof r.summary === 'string' ? r.summary.trim() : '';

  const nextQuestionsRaw = Array.isArray(r.nextQuestions) ? r.nextQuestions : [];
  const nextQuestions = nextQuestionsRaw
    .filter((q): q is string => typeof q === 'string' && q.trim().length > 0)
    .map((q) => q.trim())
    .slice(0, 3);

  // 완화된 검증: summary만 있으면 통과. cardMeanings가 비어도 카드 row만 노출하고 종합 해석은 보임.
  if (!summary) return null;

  // picks 순서/카운트로 카드 의미 정렬·보정 (못 찾으면 빈 의미)
  const aligned = picks.map((p): ConsultCardMeaning => {
    const found = cardMeanings.find(
      (m) =>
        (m.cardName && (m.cardName === p.card.nameKo || m.cardName === p.card.name)) ||
        (m.position && m.position === p.position)
    );
    return found ?? { position: p.position, cardName: p.card.nameKo, meaning: '' };
  });

  return { cardMeanings: aligned, summary, nextQuestions };
}

function statusToMessage(status: number): string {
  if (status === 429) return '요청이 많아요. 잠시 후 다시 시도해 주세요.';
  if (status === 401 || status === 403) return 'AI 해석 인증에 문제가 있어요. 잠시 후 다시 시도해 주세요.';
  if (status === 400 || status === 422) return '요청 형식 문제로 응답을 받지 못했어요. 다시 시도해 주세요.';
  if (status >= 500) return 'AI 서버에 일시 문제가 있어요. 잠시 후 다시 시도해 주세요.';
  return SERVICE_UNAVAILABLE_MESSAGE;
}

interface CallOpts {
  extraNudge: string;
  useJsonMode: boolean;
}

export const ConsultService = {
  isConfigured(): boolean {
    return !!GPT_PROXY_BASE;
  },

  /**
   * 한 턴 분의 응답 받기.
   * 1차: JSON mode + 표준 프롬프트
   * 2차(폴백): JSON mode 제거 + 강한 형식 nudge — 일부 모델/엔드포인트가 response_format을 거부하는 경우 대비
   * @throws ConsultServiceError 사용자에게 표시할 안전한 메시지
   * @throws DOMException(AbortError) signal abort 시 그대로 던진다
   */
  async getConsultTurn(input: ConsultTurnInput): Promise<ConsultTurnResult> {
    if (!GPT_PROXY_BASE) {
      throw new ConsultServiceError(SERVICE_UNAVAILABLE_MESSAGE, 'config');
    }
    const envModel = (import.meta.env.VITE_GPT_MODEL as string | undefined)?.trim();
    const model = envModel && envModel.length > 0 ? envModel : DEFAULT_GPT_MODEL;
    const systemContent = buildSystem(input.category);
    const userContent = buildUser(input);

    const callOnce = async ({ extraNudge, useJsonMode }: CallOpts): Promise<ConsultTurnResult> => {
      const body: Record<string, unknown> = {
        model,
        messages: [
          { role: 'system', content: systemContent + extraNudge },
          { role: 'user', content: userContent },
        ],
        max_tokens: 1100,
        temperature: 0.8,
      };
      if (useJsonMode) body.response_format = { type: 'json_object' };

      let response: Response;
      try {
        response = await fetch(BASE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: input.signal,
        });
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') throw e;
        console.error('[ConsultService] 네트워크 오류:', { model, useJsonMode, error: e });
        throw new ConsultServiceError(
          'AI 해석 요청을 보내지 못했어요. 네트워크를 확인해 주세요.',
          'network'
        );
      }

      if (!response.ok) {
        const bodyText = await response.text().catch(() => '');
        console.error('[ConsultService] HTTP 오류:', {
          status: response.status,
          model,
          useJsonMode,
          bodyText: bodyText.slice(0, 500),
        });
        throw new ConsultServiceError(statusToMessage(response.status), 'http');
      }

      const data = (await response.json().catch(() => null)) as
        | { choices?: { message?: { content?: string } }[] }
        | null;
      const content = data?.choices?.[0]?.message?.content;
      if (typeof content !== 'string') {
        console.error('[ConsultService] 응답 형식 비정상:', data);
        throw new ConsultServiceError(SERVICE_UNAVAILABLE_MESSAGE, 'parse');
      }

      const parsed = safeParseJson(content);
      const normalized = normalizeResult(parsed, input.picks);
      if (!normalized) {
        console.error('[ConsultService] 응답 파싱 실패:', content.slice(0, 500));
        throw new ConsultServiceError(SERVICE_UNAVAILABLE_MESSAGE, 'parse');
      }
      return normalized;
    };

    // 1차 시도
    try {
      return await callOnce({ extraNudge: '', useJsonMode: true });
    } catch (e1) {
      if (e1 instanceof DOMException && e1.name === 'AbortError') throw e1;
      // HTTP 또는 parse 실패면 fallback 1회 — JSON mode 제거 + 강한 형식 nudge
      if (e1 instanceof ConsultServiceError && (e1.kind === 'http' || e1.kind === 'parse')) {
        const nudge =
          '\n\n중요: 응답은 반드시 system 메시지에 명시된 JSON 객체 단 하나로만 출력하세요. ' +
          '코드펜스/마크다운/추가 설명/주석 금지. ' +
          'summary는 비어 있지 않도록 작성하고, cardMeanings는 [뽑힌 카드]의 순서·이름·위치를 그대로 따르세요.';
        try {
          return await callOnce({ extraNudge: nudge, useJsonMode: false });
        } catch (e2) {
          if (e2 instanceof DOMException && e2.name === 'AbortError') throw e2;
          throw e2;
        }
      }
      throw e1;
    }
  },
};
