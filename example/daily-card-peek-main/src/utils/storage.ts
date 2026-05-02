import { HistoryEntry } from "@/types/tarot";

const HISTORY_KEY = "tarot_history";
const UNLOCK_KEY = "tarot_unlocked";
const USER_SEED_KEY = "tarot_user_seed";

/** 유저(=기기)별 고정 시드 생성/조회 */
export function getOrCreateUserSeed(): string {
  try {
    const existing = localStorage.getItem(USER_SEED_KEY);
    if (existing) return existing;

    const seed =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    localStorage.setItem(USER_SEED_KEY, seed);
    return seed;
  } catch {
    // localStorage 사용이 불가한 환경에서도 "세션 내 고정"은 유지되도록 fallback
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}

/** 히스토리 저장 (최근 14일만 유지) */
export function saveToHistory(entry: HistoryEntry): void {
  const history = getHistory();
  // 같은 날짜 항목 업데이트 또는 추가
  const existing = history.findIndex((h) => h.date === entry.date);
  if (existing >= 0) {
    history[existing] = entry;
  } else {
    history.unshift(entry);
  }
  // 14일까지만 유지
  const trimmed = history.slice(0, 14);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
}

/** 히스토리 불러오기 */
export function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** 오늘 잠금 해제 상태 확인 */
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

/** 오늘 잠금 해제 */
export function unlockToday(date: string): void {
  localStorage.setItem(UNLOCK_KEY, JSON.stringify({ date, unlocked: true }));
}
