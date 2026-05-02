import { tarotCards } from './tarotData';
import type { TarotCard } from '@/types/tarot';

/** 날짜 시드로 같은 날에는 같은 카드가 나오는 랜덤 선택. */
function seededIndex(seed: string, max: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % max;
}

/**
 * 오늘의 카드: 날짜 + userSeed 기준 시드(같은 기기·같은 날이면 같은 카드).
 * userSeed 생략 시 날짜만 사용(테스트·레거시).
 */
export function getDailyCard(dateStr?: string, userSeed?: string): TarotCard {
  const date = dateStr || getTodayString();
  const seed = userSeed != null && userSeed !== '' ? `${date}|${userSeed}` : date;
  const index = seededIndex(seed, tarotCards.length);
  return tarotCards[index];
}

/**
 * 질문하기 카드: question + 날짜 + userSeed가 있으면 결정적 선택(같은 질문·같은 날·같은 기기면 동일 카드).
 * userSeed/question 없으면 기존처럼 무작위(단위 테스트 등).
 */
export function getQuestionCard(question?: string, userSeed?: string, dateStr?: string): TarotCard {
  const date = dateStr || getTodayString();
  if (userSeed != null && userSeed !== '' && question != null && question.trim() !== '') {
    const seed = `${date}|${userSeed}|${question}`;
    const index = seededIndex(seed, tarotCards.length);
    return tarotCards[index];
  }
  const index = Math.floor(Math.random() * tarotCards.length);
  return tarotCards[index];
}

export function getTodayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
