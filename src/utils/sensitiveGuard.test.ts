import { describe, expect, it } from 'vitest';
import { detectSelfHarm } from './sensitiveGuard';

describe('detectSelfHarm', () => {
  it('자살 직접 표현 감지', () => {
    expect(detectSelfHarm('자살하고 싶어요')).toBe(true);
  });
  it('"죽고 싶다" 감지', () => {
    expect(detectSelfHarm('너무 힘들어서 죽고 싶어요')).toBe(true);
  });
  it('"살기 싫다" 감지', () => {
    expect(detectSelfHarm('이제 살기 싫어요')).toBe(true);
  });
  it('"사라지고 싶다" 감지', () => {
    expect(detectSelfHarm('그냥 사라지고 싶어요')).toBe(true);
  });
  it('"자해" 감지', () => {
    expect(detectSelfHarm('자해를 해야 할까요?')).toBe(true);
  });
  it('빈 문자열은 false', () => {
    expect(detectSelfHarm('')).toBe(false);
    expect(detectSelfHarm('   ')).toBe(false);
  });
  it('일반 질문은 false', () => {
    expect(detectSelfHarm('그 사람은 나를 어떻게 생각할까?')).toBe(false);
    expect(detectSelfHarm('이번 시험은 어떨까?')).toBe(false);
    expect(detectSelfHarm('이직할까 아니면 남을까?')).toBe(false);
  });
  it('"죽음"이나 "죽다"가 단어 일부로 등장해도 직접 표현 아니면 false', () => {
    expect(detectSelfHarm('죽도록 사랑한다는 게 무슨 뜻일까?')).toBe(false);
  });
});
