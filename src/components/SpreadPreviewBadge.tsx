import { Paragraph } from '@toss/tds-mobile';
import { spacingPx, radiusPx } from '@/design/tokens';
import type { Spread } from '@/utils/decideSpread';

interface Props {
  spread: Spread;
}

/** 사용자가 입력한 질문에 대한 실시간 스프레드 결과 안내 (작은 배지). */
export default function SpreadPreviewBadge({ spread }: Props) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: spacingPx('xs'),
        padding: `${spacingPx('xxs')} ${spacingPx('sm')}`,
        borderRadius: radiusPx('full'),
        background: 'rgba(212, 168, 83, 0.12)',
        alignSelf: 'flex-start',
      }}
    >
      <span aria-hidden style={{ fontSize: 14, lineHeight: 1 }}>✨</span>
      <Paragraph typography="t7" style={{ margin: 0 }}>
        <Paragraph.Text>
          이 질문은 카드 {spread.count}장 (
          {spread.positions.join(' · ')}) 으로 풀어드려요
        </Paragraph.Text>
      </Paragraph>
    </div>
  );
}
