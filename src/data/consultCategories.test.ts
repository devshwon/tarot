import { describe, expect, it } from 'vitest';
import { CONSULT_CATEGORIES, findCategory, pickRandomPlaceholder } from './consultCategories';

describe('consultCategories 데이터', () => {
  it('5개 카테고리가 정의되어 있다', () => {
    expect(CONSULT_CATEGORIES).toHaveLength(5);
  });
  it('id가 모두 고유하다', () => {
    const ids = CONSULT_CATEGORIES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('카테고리당 placeholder 4~5개', () => {
    for (const cat of CONSULT_CATEGORIES) {
      expect(cat.placeholders.length).toBeGreaterThanOrEqual(4);
      expect(cat.placeholders.length).toBeLessThanOrEqual(5);
    }
  });
  it('각 카테고리에 emoji와 hint가 비어있지 않다', () => {
    for (const cat of CONSULT_CATEGORIES) {
      expect(cat.emoji.length).toBeGreaterThan(0);
      expect(cat.hint.length).toBeGreaterThan(0);
    }
  });
});

describe('findCategory', () => {
  it('존재하는 id를 찾는다', () => {
    expect(findCategory('love')?.label).toBe('연애·관계');
    expect(findCategory('money')?.label).toBe('금전·재물');
  });
});

describe('pickRandomPlaceholder', () => {
  it('카테고리 풀 안의 placeholder만 반환한다', () => {
    for (const cat of CONSULT_CATEGORIES) {
      for (let i = 0; i < 20; i++) {
        const p = pickRandomPlaceholder(cat);
        expect(cat.placeholders).toContain(p);
      }
    }
  });
  it('충분한 호출 시 회전한다 (최소 2개 이상의 다른 값)', () => {
    const cat = CONSULT_CATEGORIES[0];
    const seen = new Set<string>();
    for (let i = 0; i < 200; i++) {
      seen.add(pickRandomPlaceholder(cat));
    }
    expect(seen.size).toBeGreaterThanOrEqual(2);
  });
});
