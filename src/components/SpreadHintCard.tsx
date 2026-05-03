import { useState } from 'react';
import { Paragraph } from '@toss/tds-mobile';
import { spacingPx, radiusPx } from '@/design/tokens';

interface ExampleGroup {
  count: 1 | 2 | 3;
  label: string;
  examples: string[];
}

const GROUPS: ExampleGroup[] = [
  {
    count: 1,
    label: '단답으로 묻는 질문',
    examples: [
      '오늘 그 사람한테 연락해도 될까?',
      '이번 시험에 합격이 가능할까?',
    ],
  },
  {
    count: 2,
    label: '두 갈래 선택을 묻는 질문',
    examples: [
      '이직할까, 아니면 남을까?',
      'A와 B 중 어느 쪽이 나을까?',
    ],
  },
  {
    count: 3,
    label: '흐름·조언을 묻는 질문 (기본)',
    examples: [
      '그 사람은 지금 나를 어떻게 생각할까?',
      '우리 관계는 앞으로 어떻게 흘러갈까?',
    ],
  },
];

/** 카드 장수가 어떻게 정해지는지 펼침으로 보여주는 도움말 카드. */
export default function SpreadHintCard() {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="glass-card section-card"
      style={{ width: '100%', padding: spacingPx('md') }}
      role="region"
      aria-label="스프레드 안내"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacingPx('xs'),
          background: 'transparent',
          border: 'none',
          padding: 0,
          textAlign: 'left',
          cursor: 'pointer',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacingPx('xs') }}>
          <span aria-hidden>💡</span>
          <Paragraph typography="t7" style={{ margin: 0 }}>
            <Paragraph.Text fontWeight="bold">카드 장수는 어떻게 정해질까요?</Paragraph.Text>
          </Paragraph>
        </span>
        <span aria-hidden style={{ opacity: 0.6 }}>{open ? '▴' : '▾'}</span>
      </button>

      {open && (
        <div style={{ marginTop: spacingPx('md'), display: 'flex', flexDirection: 'column', gap: spacingPx('md') }}>
          {GROUPS.map((g) => (
            <div key={g.count} style={{ display: 'flex', flexDirection: 'column', gap: spacingPx('xxs') }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacingPx('xs') }}>
                <span
                  aria-hidden
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 28,
                    height: 22,
                    padding: `0 ${spacingPx('xs')}`,
                    borderRadius: radiusPx('full'),
                    background: 'rgba(212, 168, 83, 0.18)',
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {g.count}장
                </span>
                <Paragraph typography="t7" style={{ margin: 0 }}>
                  <Paragraph.Text color="gray">{g.label}</Paragraph.Text>
                </Paragraph>
              </div>
              <div style={{ paddingLeft: spacingPx('xl'), display: 'flex', flexDirection: 'column', gap: spacingPx('xxs') }}>
                {g.examples.map((ex) => (
                  <Paragraph key={ex} typography="t7" style={{ margin: 0, lineHeight: 1.55 }}>
                    <Paragraph.Text>"{ex}"</Paragraph.Text>
                  </Paragraph>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
