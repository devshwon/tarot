/** 타로 카드 데이터 타입 */
export interface TarotCard {
  id: number;
  name: string;
  nameKo: string;
  emoji: string;
  keywords: string[];
  shortReading: string;
  detailedReading: string;
  advice: string;
  luckyColor: string;
  luckyNumber: number;
}

/** 히스토리 항목 */
export interface HistoryEntry {
  date: string; // YYYY-MM-DD
  cardId: number;
  question?: string;
  unlocked: boolean;
}

/** 질문 기반 리딩 */
export interface QuestionReading {
  question: string;
  cardId: number;
  date: string;
}
