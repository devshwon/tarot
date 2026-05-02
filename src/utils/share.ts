/**
 * 공유/복사 경험 공통 유틸 (P2-02).
 * - WebView(iOS/Android)에서는 navigator.share가 없을 수 있으므로 클립보드 폴백 필수.
 * - 공유 텍스트에 질문 원문은 포함하지 않음(개인정보 정책).
 */

export const SHARE_MESSAGES = {
  successShare: '공유되었습니다',
  successCopy: '클립보드에 복사되었습니다',
  failShare: '공유에 실패했습니다. 다시 시도해 주세요.',
  failCopy: '클립보드에 복사되지 않았습니다. 다시 시도해 주세요.',
} as const;

/** Web Share API 사용 가능 여부 */
export function canUseNativeShare(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
}

export type ShareResult = { success: true; method: 'share' | 'clipboard' } | { success: false; method: 'share' | 'clipboard' };

/** 공유 시 포함할 앱 URL (복사/앱 공유 시 동일) */
export function getShareUrl(): string {
  if (typeof window === 'undefined') return '';
  const fromEnv =
    typeof import.meta !== 'undefined' &&
    import.meta.env &&
    (import.meta.env as { VITE_APP_URL?: string }).VITE_APP_URL;
  const base = typeof fromEnv === 'string' && fromEnv.trim() ? fromEnv.trim() : window.location.origin;
  return base.replace(/\/$/, '');
}

/**
 * 텍스트 공유: native share 시도 후 실패 시 클립보드로 폴백.
 * url을 주면 앱 공유·복사 모두에 URL 포함.
 */
export async function shareText(text: string, url?: string): Promise<ShareResult> {
  const shareUrl = url ?? getShareUrl();
  const textWithUrl = shareUrl ? `${text}\n\n${shareUrl}` : text;
  const useShare = canUseNativeShare();
  try {
    if (useShare) {
      await navigator.share(shareUrl ? { text: textWithUrl, url: shareUrl } : { text });
      return { success: true, method: 'share' };
    }
    if (typeof navigator.clipboard?.writeText === 'function') {
      await navigator.clipboard.writeText(textWithUrl);
      return { success: true, method: 'clipboard' };
    }
    return { success: false, method: 'clipboard' };
  } catch {
    return { success: false, method: useShare ? 'share' : 'clipboard' };
  }
}

/** 오늘의 카드 공유 문구 템플릿 (문구 변경 시 이곳만 수정) */
const SHARE_DAILY_TEMPLATE = (nameKo: string, emoji: string, shortReading: string) =>
  `🔮 타로: ${nameKo} ${emoji}\n"${shortReading}"\n\n#타로`;

export function buildDailyCardShareText(card: { nameKo: string; emoji: string; shortReading: string }): string {
  return SHARE_DAILY_TEMPLATE(card.nameKo, card.emoji, card.shortReading);
}
