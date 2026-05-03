/**
 * 타로 상담 세션 저장/조회. localStorage 키는 `tarot_` prefix를 따라 clearAppData 대상에 포함된다.
 * 최근 N개로 capped — 무한 누적 방지.
 */
import type { ConsultSession } from '@/types/consult';

const SESSIONS_KEY = 'tarot_consult_sessions';
const MAX_SESSIONS = 30;

export function getConsultSessions(): ConsultSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as ConsultSession[];
  } catch {
    return [];
  }
}

export function getConsultSession(id: string): ConsultSession | null {
  return getConsultSessions().find((s) => s.id === id) ?? null;
}

/** 새 세션 추가 또는 같은 id 세션 갱신. createdAt 내림차순 정렬, MAX_SESSIONS로 cap. */
export function saveConsultSession(session: ConsultSession): void {
  try {
    const all = getConsultSessions();
    const idx = all.findIndex((s) => s.id === session.id);
    if (idx >= 0) {
      all[idx] = session;
    } else {
      all.unshift(session);
    }
    all.sort((a, b) => b.createdAt - a.createdAt);
    const trimmed = all.slice(0, MAX_SESSIONS);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(trimmed));
  } catch {
    /* localStorage 예외 무시(시크릿 모드 등) */
  }
}

export function generateSessionId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `cs-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}
