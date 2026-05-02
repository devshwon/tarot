/**
 * TossAds 배너 광고 컴포넌트
 * 오늘의 타로 페이지 최하단 등에 배치
 * @apps-in-toss/web-framework 1.6+ (TossAds) 필요. 미지원 시 렌더링 안 함.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

const BANNER_AD_GROUP_ID = 'ait.v2.live.80f365591b5c4527';

type TossAdsModule = {
  TossAds?: {
    initialize?: {
      (opts: { callbacks?: { onInitialized?: () => void; onInitializationFailed?: (e: Error) => void } }): void;
      isSupported?: () => boolean;
    };
    attachBanner?: ((adGroupId: string, target: HTMLElement, opts?: object) => { destroy: () => void }) & {
      isSupported?: () => boolean;
    };
  };
};

function useTossBanner() {
  const [isInitialized, setIsInitialized] = useState(false);
  const tossAdsRef = useRef<TossAdsModule['TossAds']>(null);

  useEffect(() => {
    import('@apps-in-toss/web-framework')
      .then((mod: TossAdsModule) => {
        const TossAds = mod.TossAds;
        if (!TossAds?.initialize?.isSupported?.()) return;

        tossAdsRef.current = TossAds;
        TossAds.initialize({
          callbacks: {
            onInitialized: () => setIsInitialized(true),
            onInitializationFailed: (error: Error) => {
              console.warn('[BannerAd] TossAds 초기화 실패:', error);
            },
          },
        });
      })
      .catch(() => {
        // TossAds 미제공 버전 (1.5.x 등)
      });
  }, []);

  const attachBanner = useCallback(
    (element: HTMLElement): { destroy: () => void } | undefined => {
      const TossAds = tossAdsRef.current;
      const attach = TossAds?.attachBanner;
      if (!isInitialized || !attach?.isSupported?.()) return undefined;

      return attach(BANNER_AD_GROUP_ID, element, {
        theme: 'auto',
        tone: 'blackAndWhite',
        variant: 'expanded',
        callbacks: {
          onAdRendered: () => {},
          onNoFill: () => {},
          onAdFailedToRender: (p: { error?: { message?: string } }) =>
            console.warn('[BannerAd] 렌더링 실패:', p?.error?.message),
        },
      });
    },
    [isInitialized]
  );

  return { isInitialized, attachBanner };
}

export default function BannerAd() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isInitialized, attachBanner } = useTossBanner();

  useEffect(() => {
    if (!isInitialized || !containerRef.current) return;

    const attached = attachBanner(containerRef.current);

    return () => {
      attached?.destroy?.();
    };
  }, [isInitialized, attachBanner]);

  if (!isInitialized) return null;

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: 96, minHeight: 96 }}
      aria-hidden
    />
  );
}
