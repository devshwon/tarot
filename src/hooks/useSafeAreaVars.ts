/**
 * 앱인토스 공식 문서: Safe Area 여백 값 구하기
 * https://developers-apps-in-toss.toss.im/bedrock/reference/framework/화면%20제어/safe-area.html
 *
 * WebView에서는 env(safe-area-inset-*)가 0일 수 있으므로
 * SafeAreaInsets.get()으로 실제 값을 구해 CSS 변수로 주입한다.
 * 하단 고정 버튼은 paddingBottom: insets.bottom 으로 홈 인디케이터 바로 위에 위치시킨다.
 */
import { useEffect } from 'react';
import { SafeAreaInsets } from '@apps-in-toss/web-framework';

const VAR_BOTTOM = '--safe-area-inset-bottom-px';
const VAR_TOP = '--safe-area-inset-top-px';

function setSafeAreaVars(top: number, bottom: number) {
  const root = document.documentElement;
  root.style.setProperty(VAR_BOTTOM, `${bottom}px`);
  root.style.setProperty(VAR_TOP, `${top}px`);
}

export function useSafeAreaVars(): void {
  useEffect(() => {
    let top = 0;
    let bottom = 0;
    try {
      const insets = SafeAreaInsets.get();
      top = insets.top ?? 0;
      bottom = insets.bottom ?? 0;
      setSafeAreaVars(top, bottom);
    } catch {
      setSafeAreaVars(0, 0);
    }

    let cleanup: (() => void) | undefined;
    try {
      cleanup = SafeAreaInsets.subscribe({
        onEvent: (insets) => {
          const t = insets.top ?? 0;
          const b = insets.bottom ?? 0;
          setSafeAreaVars(t, b);
        },
      });
    } catch {
      /* subscribe 실패 시(비 WebView 등) 무시 */
    }

    return () => {
      cleanup?.();
      document.documentElement.style.removeProperty(VAR_BOTTOM);
      document.documentElement.style.removeProperty(VAR_TOP);
    };
  }, []);
}
