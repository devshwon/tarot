import { useState, useEffect } from 'react';
import type { TarotCard } from '@/types/tarot';
import { getTodayString } from '@/utils/dailyCard';
import { tarotCards } from '@/utils/tarotData';
import {
  getDailyPickedCardId,
  saveDailyPickedCardId,
  saveToHistory,
} from '@/utils/storage';

/**
 * 오늘의 카드 훅. 사용자가 직접 78장 중 한 장을 골라 오늘의 카드로 확정한다.
 * 같은 날 안에서는 한 번 고른 카드가 유지되고, 자정 넘기면 새로 고를 수 있다.
 */
export function useDailyCard() {
  const today = getTodayString();
  const [pickedCardId, setPickedCardId] = useState<number | null>(() =>
    getDailyPickedCardId(today)
  );
  const [revealed, setRevealed] = useState(() => getDailyPickedCardId(today) != null);

  useEffect(() => {
    const saved = getDailyPickedCardId(today);
    setPickedCardId(saved);
    setRevealed(saved != null);
  }, [today]);

  const card: TarotCard | null =
    pickedCardId != null
      ? tarotCards.find((c) => c.id === pickedCardId) ?? null
      : null;

  const pickCard = (chosen: TarotCard) => {
    saveDailyPickedCardId(today, chosen.id);
    setPickedCardId(chosen.id);
    setRevealed(true);
    saveToHistory({
      date: today,
      cardId: chosen.id,
      unlocked: true,
    });
  };

  const revealCard = () => setRevealed(true);

  return {
    card,
    hasPicked: pickedCardId != null,
    revealed,
    revealCard,
    today,
    pickCard,
  };
}
