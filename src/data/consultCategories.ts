import type { Category, CategoryId } from '@/types/consult';

export const CONSULT_CATEGORIES: readonly Category[] = [
  {
    id: 'love',
    label: '연애·관계',
    emoji: '💞',
    hint: '마음·관계·궁합 무엇이든 편하게 물어보세요.',
    placeholders: [
      '그 사람은 지금 나를 어떻게 생각할까?',
      '우리 관계는 앞으로 어떻게 흘러갈까?',
      '헤어진 그 사람과 다시 이어질 수 있을까?',
      '이 사람에게 마음을 표현할까, 아니면 거리를 둘까?',
      '우리 둘은 잘 맞는 사이일까?',
    ],
  },
  {
    id: 'money',
    label: '금전·재물',
    emoji: '💰',
    hint: '단정적인 투자 판단은 피해주세요.',
    placeholders: [
      '이번 달 재정 흐름은 어떨까?',
      '이번 달 지출을 줄일까, 아니면 그대로 갈까?',
      '지금 큰 지출을 해도 괜찮을까?',
      '올해 안에 재정 상황이 나아질까?',
    ],
  },
  {
    id: 'career',
    label: '진로·시험',
    emoji: '🎯',
    hint: '결과 단정보다 흐름을 보는 톤으로 답해드려요.',
    placeholders: [
      '이번 시험·면접의 흐름은 어떨까?',
      '지금 자리에 남을까, 아니면 새 일을 시작할까?',
      '새 일을 시작하기에 적절한 시기일까?',
      '준비하는 자격증·입시는 어떤 결과로 흐를까?',
      '지금 커리어 방향이 나에게 맞을까?',
    ],
  },
  {
    id: 'social',
    label: '인간관계',
    emoji: '🤝',
    hint: '관계의 흐름과 조언 위주로 봐드려요.',
    placeholders: [
      '요즘 멀어진 그 사람과의 관계는 어떻게 풀어가야 할까?',
      '이 사람과 거리를 둘까, 아니면 다가설까?',
      '새로 만나는 사람들과 잘 어울릴 수 있을까?',
      '직장에서의 인간관계는 어떻게 풀릴까?',
    ],
  },
  {
    id: 'choice',
    label: '선택·미래',
    emoji: '🧭',
    hint: '선택지나 다가올 흐름을 함께 살펴봐요.',
    placeholders: [
      '지금 고민 중인 두 가지 선택, 어느 쪽이 나을까?',
      '다가오는 변화는 나에게 어떤 의미일까?',
      '지금 쉬어갈까, 아니면 밀고 나갈까?',
      '곧 찾아올 흐름은 어떤 모습일까?',
      '이 결정을 미루는 게 나을까?',
    ],
  },
] as const;

export function findCategory(id: CategoryId): Category | undefined {
  return CONSULT_CATEGORIES.find((c) => c.id === id);
}

export function pickRandomPlaceholder(category: Category): string {
  const i = Math.floor(Math.random() * category.placeholders.length);
  return category.placeholders[i];
}
