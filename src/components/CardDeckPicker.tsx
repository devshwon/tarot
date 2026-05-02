import { useEffect, useMemo, useRef, useState } from 'react';
import { Paragraph } from '@toss/tds-mobile';
import { tarotCards } from '@/utils/tarotData';
import type { TarotCard } from '@/types/tarot';
import { layout, spacingPx } from '@/design/tokens';

interface CardDeckPickerProps {
  onConfirm: (card: TarotCard) => void;
}

function shuffle<T>(arr: readonly T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const CONFIRM_DELAY_MS = 350;

/**
 * 78장 카드 뒷면을 가로 스크롤로 펼쳐 보여주고 한 장을 고르게 한다.
 * - 첫 탭: pending (살짝 떠오름) — 실수 방지용 1단계
 * - 같은 카드 두 번째 탭: confirm 애니메이션 후 onConfirm
 * - 다른 카드 탭: pending이 그쪽으로 이동
 */
export default function CardDeckPicker({ onConfirm }: CardDeckPickerProps) {
  const deck = useMemo(() => shuffle(tarotCards), []);
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);
  const [confirmingIndex, setConfirmingIndex] = useState<number | null>(null);
  const lockedRef = useRef(false);

  useEffect(() => {
    if (confirmingIndex == null) return;
    const t = window.setTimeout(() => {
      onConfirm(deck[confirmingIndex]);
    }, CONFIRM_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [confirmingIndex, deck, onConfirm]);

  const handleTap = (i: number) => {
    if (lockedRef.current) return;
    if (pendingIndex === i) {
      lockedRef.current = true;
      setConfirmingIndex(i);
      return;
    }
    setPendingIndex(i);
  };

  const itemStyle = {
    width: layout.cardPickWidth,
    height: layout.cardPickHeight,
  } as const;

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: spacingPx('sm'), width: '100%', minWidth: 0 }}
      role="region"
      aria-label="카드 선택"
    >
      <Paragraph typography="t6" style={{ margin: 0, textAlign: 'center' }}>
        <Paragraph.Text fontWeight="bold">마음이 가는 카드를 한 장 골라 보세요</Paragraph.Text>
      </Paragraph>
      <Paragraph typography="t7" style={{ margin: 0, textAlign: 'center' }}>
        <Paragraph.Text color="gray">
          {pendingIndex == null
            ? '좌우로 넘기며 카드를 살펴 보세요.'
            : '같은 카드를 한 번 더 탭하면 확정됩니다.'}
        </Paragraph.Text>
      </Paragraph>
      <div className="card-deck-scroll" role="list">
        <div className="card-deck-track">
          {deck.map((card, i) => {
            const isPending = pendingIndex === i && confirmingIndex == null;
            const isConfirming = confirmingIndex === i;
            const className = `card-deck-item${isPending ? ' is-pending' : ''}${isConfirming ? ' is-confirming' : ''}`;
            return (
              <button
                key={card.id}
                type="button"
                role="listitem"
                aria-label={`${i + 1}번째 카드${isPending ? ', 한 번 더 탭하여 확정' : ''}`}
                aria-pressed={isPending || isConfirming}
                className={className}
                style={{
                  ...itemStyle,
                  marginLeft: i === 0 ? 0 : -layout.cardPickOverlap,
                }}
                onClick={() => handleTap(i)}
              >
                <img
                  src="/TarotCard.png"
                  alt=""
                  className="card-deck-back-img"
                  referrerPolicy="no-referrer"
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
