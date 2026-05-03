import { describe, expect, it } from 'vitest';
import { decideSpread } from './decideSpread';

describe('decideSpread', () => {
  describe('1장 (yes/no 단답)', () => {
    it('"해도 될까" 패턴', () => {
      expect(decideSpread('오늘 그 사람한테 연락해도 될까?').count).toBe(1);
    });
    it('"해도 괜찮을까" 패턴', () => {
      expect(decideSpread('지금 큰 지출을 해도 괜찮을까?').count).toBe(1);
    });
    it('"맞을까" 패턴', () => {
      expect(decideSpread('지금 커리어 방향이 나에게 맞을까?').count).toBe(1);
    });
    it('"가능할까" 패턴', () => {
      expect(decideSpread('이번 시험에 합격이 가능할까?').count).toBe(1);
    });
    it('"할 수 있을까" 패턴', () => {
      expect(decideSpread('새로 만나는 사람들과 잘 어울릴 수 있을까?').count).toBe(1);
    });
  });

  describe('2장 (비교)', () => {
    it('"어느 쪽" 패턴', () => {
      expect(decideSpread('지금 고민 중인 두 가지 선택, 어느 쪽이 나을까?').count).toBe(2);
    });
    it('"두 가지" 패턴 (단독)', () => {
      expect(decideSpread('두 가지 옵션 중 더 나은 흐름은 무엇일까?').count).toBe(2);
    });
    it('"아니면" 패턴', () => {
      expect(decideSpread('이직할까 아니면 남을까?').count).toBe(2);
    });
    it('"A와 B 중" 패턴', () => {
      expect(decideSpread('A 회사와 B 회사 중 어디가 나을까?').count).toBe(2);
    });
    it('영문 "or" 패턴', () => {
      expect(decideSpread('지금 시작 or 조금 더 기다리기, 어느 쪽?').count).toBe(2);
    });
  });

  describe('3장 (기본 흐름·조언)', () => {
    it('상태/감정 질문', () => {
      expect(decideSpread('그 사람은 지금 나를 어떻게 생각할까?').count).toBe(3);
    });
    it('미래 흐름 질문', () => {
      expect(decideSpread('우리 관계는 앞으로 어떻게 흘러갈까?').count).toBe(3);
    });
    it('의미 질문', () => {
      expect(decideSpread('다가오는 변화는 나에게 어떤 의미일까?').count).toBe(3);
    });
    it('빈 문자열은 기본 3장', () => {
      expect(decideSpread('').count).toBe(3);
    });
  });

  describe('positions 일관성', () => {
    it('1장 spread는 positions 길이 1', () => {
      const s = decideSpread('가능할까?');
      expect(s.positions).toHaveLength(s.count);
    });
    it('2장 spread는 positions 길이 2', () => {
      const s = decideSpread('A 아니면 B?');
      expect(s.positions).toHaveLength(s.count);
    });
    it('3장 spread는 positions 길이 3', () => {
      const s = decideSpread('흐름은?');
      expect(s.positions).toHaveLength(s.count);
    });
  });

  describe('우선순위: 비교가 yes/no보다 우선', () => {
    it('"~괜찮을까"라도 비교 패턴이 있으면 2장', () => {
      // "괜찮을까"(YESNO) + "아니면"(COMPARISON) 동시 — 비교 우선
      expect(decideSpread('이걸 해도 괜찮을까 아니면 다른 길이 나을까?').count).toBe(2);
    });
  });
});
