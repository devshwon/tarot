import { tarotCards } from "./tarotData";
import { TarotCard } from "@/types/tarot";

/**
 * 날짜 + 유저(기기) 시드 기반 결정적 해시로 오늘의 카드를 선택합니다.
 * 같은 유저는 같은 날짜에 항상 같은 카드가 나옵니다.
 */
export function getDailyCard(dateStr?: string, userSeed?: string): TarotCard {
  const date = dateStr || getTodayString();
  const seed = userSeed ? `${date}-${userSeed}` : date;
  const hash = simpleHash(seed);
  const index = Math.abs(hash) % tarotCards.length;
  return tarotCards[index];
}

/**
 * 질문 + 날짜(+ 유저 시드) 기반 카드 선택 (질문/유저에 따라 다른 카드)
 */
export function getQuestionCard(question: string, userSeed?: string): TarotCard {
  const date = getTodayString();
  const seed = userSeed ? `${date}-${userSeed}-${question}` : `${date}-${question}`;
  const hash = simpleHash(seed);
  const index = Math.abs(hash) % tarotCards.length;
  return tarotCards[index];
}

/** 오늘 날짜를 YYYY-MM-DD 형식으로 반환 */
export function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

/** 간단한 문자열 해시 함수 (DJB2) */
function simpleHash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return hash >>> 0;
}
