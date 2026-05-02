import { format, parseISO, subDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { HistoryEntry } from '@/types/tarot';
import { getTodayString } from './dailyCard';

export const MAX_HISTORY_DAYS = 14;

/** 앱 전용 localStorage 키 접두사. 초기화 시 이 접두사 키만 삭제한다. */
export const STORAGE_KEYS_PREFIX = 'tarot_';

const HISTORY_KEY = `${STORAGE_KEYS_PREFIX}history`;
const UNLOCK_KEY = `${STORAGE_KEYS_PREFIX}unlocked`;
const SHARE_REWARD_KEY = `${STORAGE_KEYS_PREFIX}shareReward`;
const USER_SEED_KEY = `${STORAGE_KEYS_PREFIX}user_seed`;
const DAILY_PICK_KEY = `${STORAGE_KEYS_PREFIX}daily_pick`;

/**
 * 기기(브라우저)당 1회 생성되는 고정 시드. 같은 날짜라도 사용자별로 다른 오늘의 카드에 사용한다.
 * 초기화(clearAppData) 시 함께 삭제되며, 다음 실행 시 새 시드가 생긴다.
 */
export function getOrCreateUserSeed(): string {
  try {
    const existing = localStorage.getItem(USER_SEED_KEY);
    if (existing != null && existing !== '') return existing;

    const seed =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    localStorage.setItem(USER_SEED_KEY, seed);
    return seed;
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}

/** 앱 데이터만 삭제(prefix 일치 키만). 다른 사이트 데이터는 건드리지 않는다. */
export function clearAppData(): void {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key != null && key.startsWith(STORAGE_KEYS_PREFIX)) keysToRemove.push(key);
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k));
}

export function saveToHistory(entry: HistoryEntry): void {
  const history = getHistory();
  const hasQuestion = entry.question != null && entry.question.trim() !== '';
  const existing = hasQuestion
    ? history.findIndex((h) => h.date === entry.date && h.question === entry.question)
    : history.findIndex((h) => h.date === entry.date && (h.question == null || h.question === ''));
  if (existing >= 0) {
    history[existing] = { ...history[existing], ...entry };
  } else {
    history.unshift(entry);
  }
  const trimmed = history.slice(0, MAX_HISTORY_DAYS);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
}

/** 해당 날짜(및 선택 시 질문) 기록에 GPT 상세 해석만 갱신. */
export function updateHistoryGptDetail(date: string, gptDetail: string, question?: string | null): void {
  const history = getHistory();
  const idx =
    question != null && question.trim() !== ''
      ? history.findIndex((h) => h.date === date && h.question === question)
      : history.findIndex((h) => h.date === date && (h.question == null || h.question === ''));
  if (idx < 0) return;
  history[idx] = { ...history[idx], gptDetail, unlocked: true };
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

/** 기록 목록용 사용자 친화적 날짜 표시 (오늘 / 어제 / M월 d일) */
export function formatHistoryDate(isoDate: string): string {
  const today = getTodayString();
  if (isoDate === today) return '오늘';
  const yesterday = format(subDays(parseISO(today + 'T00:00:00'), 1), 'yyyy-MM-dd');
  if (isoDate === yesterday) return '어제';
  return format(parseISO(isoDate + 'T00:00:00'), 'M월 d일', { locale: ko });
}

export function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isUnlockedToday(date: string): boolean {
  try {
    const raw = localStorage.getItem(UNLOCK_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    return data.date === date && data.unlocked === true;
  } catch {
    return false;
  }
}

export function unlockToday(date: string): void {
  localStorage.setItem(UNLOCK_KEY, JSON.stringify({ date, unlocked: true }));
}

/** 오늘 사용자가 고른 카드 id. 다른 날짜이거나 없으면 null. */
export function getDailyPickedCardId(date: string): number | null {
  try {
    const raw = localStorage.getItem(DAILY_PICK_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data?.date === date && typeof data?.cardId === 'number') return data.cardId;
    return null;
  } catch {
    return null;
  }
}

export function saveDailyPickedCardId(date: string, cardId: number): void {
  try {
    localStorage.setItem(DAILY_PICK_KEY, JSON.stringify({ date, cardId }));
  } catch {
    /* localStorage 예외 무시(시크릿 모드 등) */
  }
}

/** 친구 초대 리워드: 해석권(광고 없이 상세 해석 1회) 개수 */
export function getShareRewardCount(): number {
  try {
    const raw = localStorage.getItem(SHARE_REWARD_KEY);
    if (raw == null) return 0;
    const n = Number.parseInt(raw, 10);
    return Number.isNaN(n) || n < 0 ? 0 : n;
  } catch {
    return 0;
  }
}

export function addShareRewardCredits(amount: number): void {
  if (amount <= 0) return;
  const current = getShareRewardCount();
  localStorage.setItem(SHARE_REWARD_KEY, String(current + amount));
}

/** 해석권 1개 사용. 사용 가능 시 true 반환 후 차감, 없으면 false */
export function useShareRewardCredit(): boolean {
  const current = getShareRewardCount();
  if (current <= 0) return false;
  localStorage.setItem(SHARE_REWARD_KEY, String(current - 1));
  return true;
}
