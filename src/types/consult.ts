export type CategoryId = 'love' | 'money' | 'career' | 'social' | 'choice';

export interface Category {
  id: CategoryId;
  label: string;
  emoji: string;
  hint: string;
  placeholders: string[];
}

export type ConsultStage = 'category' | 'input' | 'pick' | 'result' | 'closing';

/** 세션의 한 턴: 사용자 질문 + 뽑은 카드(id+위치) + LLM 응답 결과 */
export interface ConsultSessionTurn {
  question: string;
  spreadCount: 1 | 2 | 3;
  /** 카드 id와 그 위치(상황/조언/결과 등). tarotData에서 카드 풀어냄. */
  cards: { id: number; position: string }[];
  cardMeanings: { position: string; cardName: string; meaning: string }[];
  summary: string;
  /** 턴 생성 시각(epoch ms) */
  createdAt: number;
}

export interface ConsultSession {
  id: string;
  /** 세션 생성 시각(epoch ms) */
  createdAt: number;
  /** YYYY-MM-DD */
  date: string;
  categoryId: CategoryId;
  categoryLabel: string;
  turns: ConsultSessionTurn[];
  /** "이만 듣기"로 마무리되었으면 채워짐 */
  closingMessage?: string;
}
