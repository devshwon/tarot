/**
 * 민감 영역 감지. 자해·자살 표현이 포함된 질문은 카드 진행 대신 전문 상담 안내로 우회한다.
 * 의료/도박/투자 같은 다른 민감 영역은 LLM 프롬프트의 가드라인으로 톤을 제한한다 (별도 차단 X).
 */

const SELF_HARM_PATTERNS: RegExp[] = [
  /자\s*살/,
  /죽\s*고\s*싶/,
  /죽\s*어\s*야/,
  /살\s*기\s*싫/,
  /살\s*고\s*싶지\s*않/,
  /사\s*라\s*지\s*고\s*싶/,
  /끝\s*내\s*고\s*싶/,
  /목\s*숨\s*을?\s*끊/,
  /자\s*해/,
];

export function detectSelfHarm(question: string): boolean {
  const q = question.trim();
  if (!q) return false;
  for (const p of SELF_HARM_PATTERNS) {
    if (p.test(q)) return true;
  }
  return false;
}

export interface Hotline {
  label: string;
  number: string;
}

export const SELF_HARM_GUIDANCE = {
  title: '잠시만요',
  message:
    '지금 마음이 많이 무거우신 것 같아요. 카드보다, 따뜻하게 들어줄 사람과 먼저 이야기 나눠보시는 건 어떨까요? 24시간 무료로 도움받을 수 있는 곳이 있어요.',
  hotlines: [
    { label: '자살예방상담전화', number: '1393' },
    { label: '정신건강위기상담', number: '1577-0199' },
  ] as Hotline[],
};
