/**
 * 리워드 광고 연동 (앱인토스 GoogleAdMob).
 * 종료 사유를 호출자에게 분명히 전달하기 위해 콜백을 3종으로 분리한다.
 *   - onRewarded: 광고를 끝까지 시청하여 보상 이벤트가 발생한 경우
 *   - onDismiss : 사용자가 보상 전 광고를 닫은 경우 (결과를 노출하지 않아야 한다)
 *   - onFailed  : 광고 미지원 환경/로드 실패/표시 실패 (호출자가 재시도 또는 우회 결정)
 *
 * .env의 VITE_AD_UNIT_ID(광고 그룹 ID) 사용. 미설정 시 기본값 사용.
 */
import { GoogleAdMob } from '@apps-in-toss/web-framework';

const DEFAULT_AD_GROUP_ID = 'ait.v2.live.d761fffe314840db';

function getAdGroupId(): string {
  if (typeof import.meta === 'undefined' || !import.meta.env) return DEFAULT_AD_GROUP_ID;
  const id = import.meta.env.VITE_AD_UNIT_ID;
  const trimmed = typeof id === 'string' ? id.trim() : '';
  return trimmed || DEFAULT_AD_GROUP_ID;
}

export interface RewardedAdCallbacks {
  onRewarded: () => void;
  onDismiss: () => void;
  onFailed: () => void;
}

/**
 * 리워드 광고를 띄우고 종료 사유에 따라 콜백을 한 번만 호출한다.
 * userEarnedReward가 먼저 도착했다면 그 후 dismissed가 따라와도 onDismiss를 호출하지 않는다.
 */
export function showRewardedAd(callbacks: RewardedAdCallbacks): void {
  const { onRewarded, onDismiss, onFailed } = callbacks;
  const adGroupId = getAdGroupId();

  if (GoogleAdMob.loadAppsInTossAdMob.isSupported() !== true) {
    onFailed();
    return;
  }

  let settled = false;
  const settle = (fn: () => void) => {
    if (settled) return;
    settled = true;
    fn();
  };

  const cleanupLoad = GoogleAdMob.loadAppsInTossAdMob({
    options: { adGroupId },
    onEvent: (event) => {
      if (event.type !== 'loaded') return;
      cleanupLoad();
      const loadedAdUnitId = event.data?.adUnitId;
      const showOptions = loadedAdUnitId
        ? ({ adGroupId, adUnitId: loadedAdUnitId } as { adGroupId: string; adUnitId?: string })
        : { adGroupId };

      const cleanupShow = GoogleAdMob.showAppsInTossAdMob({
        options: showOptions,
        onEvent: (ev) => {
          if (ev.type === 'userEarnedReward') {
            cleanupShow();
            settle(onRewarded);
            return;
          }
          if (ev.type === 'dismissed') {
            cleanupShow();
            settle(onDismiss);
            return;
          }
          if (ev.type === 'failedToShow') {
            cleanupShow();
            settle(onFailed);
            return;
          }
        },
        onError: () => {
          cleanupShow();
          settle(onFailed);
        },
      });
    },
    onError: () => {
      cleanupLoad();
      settle(onFailed);
    },
  });
}

export const AdService = {
  getAdUnitId: getAdGroupId,
  showRewardedAd,
};
