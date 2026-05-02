import { describe, it, expect, beforeEach } from 'vitest';
import {
  clearAppData,
  getHistory,
  saveToHistory,
  isUnlockedToday,
  unlockToday,
  MAX_HISTORY_DAYS,
  STORAGE_KEYS_PREFIX,
} from './storage';

describe('storage', () => {
  beforeEach(() => {
    clearAppData();
  });

  it('getHistory는 초기에는 빈 배열을 반환한다', () => {
    expect(getHistory()).toEqual([]);
  });

  it('saveToHistory 후 getHistory로 동일 항목을 읽을 수 있다', () => {
    saveToHistory({
      date: '2025-02-22',
      cardId: 1,
      unlocked: false,
    });
    const list = getHistory();
    expect(list).toHaveLength(1);
    expect(list[0].date).toBe('2025-02-22');
    expect(list[0].cardId).toBe(1);
    expect(list[0].unlocked).toBe(false);
  });

  it('같은 날짜로 다시 저장하면 기존 항목이 갱신된다', () => {
    saveToHistory({ date: '2025-02-22', cardId: 1, unlocked: false });
    saveToHistory({ date: '2025-02-22', cardId: 2, unlocked: true });
    const list = getHistory();
    expect(list).toHaveLength(1);
    expect(list[0].cardId).toBe(2);
    expect(list[0].unlocked).toBe(true);
  });

  it('clearAppData 후 getHistory는 빈 배열을 반환한다', () => {
    saveToHistory({ date: '2025-02-22', cardId: 0, unlocked: false });
    expect(getHistory()).toHaveLength(1);
    clearAppData();
    expect(getHistory()).toEqual([]);
  });

  it('isUnlockedToday는 unlockToday 호출 후 해당 날짜에 true를 반환한다', () => {
    const date = '2025-02-22';
    expect(isUnlockedToday(date)).toBe(false);
    unlockToday(date);
    expect(isUnlockedToday(date)).toBe(true);
  });

  it('MAX_HISTORY_DAYS는 14이다', () => {
    expect(MAX_HISTORY_DAYS).toBe(14);
  });

  it('STORAGE_KEYS_PREFIX는 tarot_이다', () => {
    expect(STORAGE_KEYS_PREFIX).toBe('tarot_');
  });
});
