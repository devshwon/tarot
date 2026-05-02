export interface TarotCard {
  id: number;
  name: string;
  nameKo: string;
  emoji: string;
  /** 카드 앞면 이미지 URL (무료·저작권 없는 이미지). 없으면 emoji 표시 */
  imageUrl?: string;
  keywords: string[];
  shortReading: string;
  detailedReading: string;
  advice: string;
  luckyColor: string;
  luckyNumber: number;
}

export interface HistoryEntry {
  date: string;
  cardId: number;
  question?: string;
  unlocked: boolean;
  /** GPT로 받은 추가 상세 해석 (상세 페이지에서 요청 시 저장) */
  gptDetail?: string;
}
