import { describe, it, expect } from 'vitest';
import { getDailyCard, getQuestionCard } from './dailyCard';

describe('dailyCard', () => {
  describe('getDailyCard 결정성', () => {
    it('동일 날짜·동일 userSeed면 동일 카드를 반환한다', () => {
      const date = '2025-02-22';
      const userSeed = 'test-user-seed';
      const a = getDailyCard(date, userSeed);
      const b = getDailyCard(date, userSeed);
      expect(a.id).toBe(b.id);
      expect(a.nameKo).toBe(b.nameKo);
    });

    it('동일 날짜라도 userSeed가 다르면 (보통) 다른 카드를 반환한다', () => {
      const date = '2025-02-22';
      const a = getDailyCard(date, 'seed-a');
      const b = getDailyCard(date, 'seed-b');
      expect(a.id !== b.id || a.nameKo !== b.nameKo).toBe(true);
    });

    it('다른 날짜면 (보통) 다른 카드를 반환한다', () => {
      const userSeed = 'same-seed';
      const a = getDailyCard('2025-02-22', userSeed);
      const b = getDailyCard('2025-02-23', userSeed);
      // 해시 충돌 가능성은 낮음
      expect(a.id !== b.id || a.nameKo !== b.nameKo).toBe(true);
    });
  });

  describe('getQuestionCard', () => {
    it('덱에 있는 카드 하나를 반환한다', () => {
      const card = getQuestionCard();
      expect(card).toBeDefined();
      expect(typeof card.id).toBe('number');
      expect(typeof card.nameKo).toBe('string');
      expect(card.nameKo.length).toBeGreaterThan(0);
    });
  });
});
