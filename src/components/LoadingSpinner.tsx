/**
 * 재사용 로딩 UI (P0-02). 토큰 기반.
 */
import { spacingPx } from '@/design/tokens';

const size = spacingPx('xxl');

export default function LoadingSpinner() {
  return (
    <div
      className="page-state-loading-spinner"
      style={{ width: size, height: size }}
      role="status"
      aria-label="로딩 중"
    />
  );
}
