import { useEffect, useMemo, useRef, useState } from 'react';
import { Paragraph } from '@toss/tds-mobile';
import { tarotCards } from '@/utils/tarotData';
import type { TarotCard } from '@/types/tarot';
import { layout, spacingPx } from '@/design/tokens';
import type { SpreadCount } from '@/utils/decideSpread';

interface Props {
  count: SpreadCount;
  positions: string[];
  onComplete: (cards: TarotCard[]) => void;
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
 * N장 시리얼 픽. 한 장 확정 → 다음 위치 안내. 이미 뽑힌 카드는 비활성.
 */
export default function MultiCardDeckPicker({ count, positions, onComplete }: Props) {
  const deck = useMemo(() => shuffle(tarotCards), []);
  const [pickedIndices, setPickedIndices] = useState<number[]>([]);
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);
  const [confirmingIndex, setConfirmingIndex] = useState<number | null>(null);
  const lockedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const currentStep = pickedIndices.length;
  const currentPosition = positions[currentStep] ?? '';
  const isComplete = pickedIndices.length >= count;

  useEffect(() => {
    if (confirmingIndex == null) return;
    const idx = confirmingIndex;
    const t = window.setTimeout(() => {
      setPickedIndices((prev) => {
        const next = [...prev, idx];
        if (next.length >= count) {
          window.setTimeout(() => {
            onCompleteRef.current(next.map((i) => deck[i]));
          }, 0);
        }
        return next;
      });
      setPendingIndex(null);
      setConfirmingIndex(null);
      lockedRef.current = false;
    }, CONFIRM_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [confirmingIndex, deck, count]);

  const handleTap = (i: number) => {
    if (lockedRef.current) return;
    if (isComplete) return;
    if (pickedIndices.includes(i)) return;
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

  const stepBadge = count > 1 ? `${currentStep + 1}/${count} · ` : '';

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: spacingPx('sm'), width: '100%', minWidth: 0 }}
      role="region"
      aria-label="카드 선택"
    >
      <Paragraph typography="t6" style={{ margin: 0, textAlign: 'center' }}>
        <Paragraph.Text fontWeight="bold">
          {isComplete
            ? '카드를 모두 뽑았어요'
            : `${stepBadge}'${currentPosition}' 카드를 골라 보세요`}
        </Paragraph.Text>
      </Paragraph>
      <Paragraph typography="t7" style={{ margin: 0, textAlign: 'center' }}>
        <Paragraph.Text color="gray">
          {isComplete
            ? '잠시 후 결과로 이어집니다.'
            : pendingIndex == null
              ? '좌우로 넘기며 카드를 살펴 보세요.'
              : '같은 카드를 한 번 더 탭하면 확정됩니다.'}
        </Paragraph.Text>
      </Paragraph>
      <div className="card-deck-scroll" role="list">
        <div className="card-deck-track">
          {deck.map((card, i) => {
            const isPicked = pickedIndices.includes(i);
            const isPending = pendingIndex === i && confirmingIndex == null;
            const isConfirming = confirmingIndex === i;
            const className = `card-deck-item${isPicked ? ' is-picked' : ''}${isPending ? ' is-pending' : ''}${isConfirming ? ' is-confirming' : ''}`;
            return (
              <button
                key={card.id}
                type="button"
                role="listitem"
                disabled={isPicked || isComplete}
                aria-label={
                  isPicked
                    ? `${i + 1}번째 카드, 이미 뽑힘`
                    : `${i + 1}번째 카드${isPending ? ', 한 번 더 탭하여 확정' : ''}`
                }
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
