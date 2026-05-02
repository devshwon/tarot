import { useState, useEffect } from "react";
import { TarotCard } from "@/types/tarot";
import { getDailyCard, getTodayString } from "@/utils/dailyCard";
import {
  getOrCreateUserSeed,
  isUnlockedToday,
  unlockToday,
  saveToHistory,
} from "@/utils/storage";

/**
 * 오늘의 카드 상태를 관리하는 커스텀 훅
 */
export function useDailyCard() {
  const today = getTodayString();
  const [card, setCard] = useState<TarotCard | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    const userSeed = getOrCreateUserSeed();
    const dailyCard = getDailyCard(today, userSeed);
    setCard(dailyCard);
    setUnlocked(isUnlockedToday(today));

    // 히스토리에 저장
    saveToHistory({
      date: today,
      cardId: dailyCard.id,
      unlocked: isUnlockedToday(today),
    });
  }, [today]);

  const revealCard = () => setRevealed(true);

  const unlock = () => {
    unlockToday(today);
    setUnlocked(true);
    if (card) {
      saveToHistory({ date: today, cardId: card.id, unlocked: true });
    }
  };

  return { card, revealed, revealCard, unlocked, unlock, today };
}
