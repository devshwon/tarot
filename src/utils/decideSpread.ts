export type SpreadCount = 1 | 2 | 3;

export interface Spread {
  count: SpreadCount;
  positions: string[];
}

const COMPARISON_PATTERNS: RegExp[] = [
  /\bor\b/i,
  /\bvs\b/i,
  /둘\s*중/,
  /어느\s*쪽/,
  /어느\s*것/,
  /어느게/,
  /\S+\s*아니면\s*\S+/,
  /(과|와)\s+.+\s+중/,
  /두\s*가지/,
];

const YESNO_PATTERNS: RegExp[] = [
  /해도\s*(될까|괜찮을까|좋을까)/,
  /수\s*있을까/,
  /가능할까/,
  /괜찮을까/,
  /맞을까/,
];

const SPREAD_2: Spread = { count: 2, positions: ['지금의 나', '다른 길'] };
const SPREAD_1: Spread = { count: 1, positions: ['지금의 흐름'] };
const SPREAD_3: Spread = { count: 3, positions: ['상황', '조언', '결과'] };

export function decideSpread(question: string): Spread {
  const q = question.trim();
  if (!q) return SPREAD_3;

  for (const p of COMPARISON_PATTERNS) {
    if (p.test(q)) return SPREAD_2;
  }
  for (const p of YESNO_PATTERNS) {
    if (p.test(q)) return SPREAD_1;
  }
  return SPREAD_3;
}
