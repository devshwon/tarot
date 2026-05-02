/**
 * Toss Look Design Tokens
 * 간격·모서리·타이포는 이 토큰만 사용. 임의 숫자 하드코딩 금지.
 */

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  xxxxl: 48,
} as const;

export type SpacingKey = keyof typeof spacing;

export function spacingPx(key: SpacingKey): string {
  return `${spacing[key]}px`;
}

export const type = {
  title: ['t4', 't5'] as const,
  subtitle: ['t5', 't6'] as const,
  body: ['t6', 't7'] as const,
  caption: ['t7'] as const,
} as const;

export type TypeHierarchy = keyof typeof type;

export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
} as const;

export type RadiusKey = keyof typeof radius;

export function radiusPx(key: RadiusKey): string {
  return key === 'full' ? '9999px' : `${radius[key]}px`;
}

/** 레이아웃 고정 치수 (카드 등). 임의 px 하드코딩 방지 */
export const layout = {
  cardWidth: 224,
  /** 카드 픽 단계: 가로 스크롤 덱에 펼쳐지는 카드 뒷면 폭(px). 5:7 비율 가정 */
  cardPickWidth: 110,
  /** 카드 픽 단계: 카드 높이(px). cardPickWidth × 7/5 */
  cardPickHeight: 154,
  /** 카드 픽 단계: 인접 카드 간 겹침(px). 폭의 절반 ≒ 카드의 절반만 노출 */
  cardPickOverlap: 55,
  /** 접근성: 터치 영역 최소 권장치(px) */
  touchTargetMin: 44,
} as const;

export type LayoutKey = keyof typeof layout;

export function layoutPx(key: LayoutKey): string {
  return `${layout[key]}px`;
}
