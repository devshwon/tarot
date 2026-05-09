import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Paragraph } from '@toss/tds-mobile';
import { useDailyCard } from '@/hooks/useDailyCard';
import CardReveal from '@/components/CardReveal';
import CardDeckPicker from '@/components/CardDeckPicker';
import ConsultEntryCard from '@/components/ConsultEntryCard';
import { spacingPx } from '@/design/tokens';

const PICK_TRANSITION_MS = 700;

export default function HomePage() {
  const { card, hasPicked, revealed, revealCard, today, pickCard } = useDailyCard();
  const navigate = useNavigate();
  const initialHasPickedRef = useRef(hasPicked);

  /**
   * 픽한 카드가 있으면 항상 /detail 로 이동.
   * - 첫 마운트 시 이미 픽된 상태(다른 화면 갔다가 복귀): 즉시 이동
   * - 이번 세션에서 새로 픽한 경우: 잠깐 카드 보여 주고 이동
   */
  useEffect(() => {
    if (!hasPicked || !card) return;
    const delay = initialHasPickedRef.current ? 0 : PICK_TRANSITION_MS;
    const t = window.setTimeout(() => navigate('/detail', { replace: true }), delay);
    return () => window.clearTimeout(t);
  }, [hasPicked, card, navigate]);

  if (!hasPicked || card == null) {
    return (
      <div className="page-home">
        <div style={{ width: '100%', marginBottom: spacingPx('lg') }}>
          <ConsultEntryCard />
        </div>
        <header className="page-home-header" style={{ textAlign: 'center' }}>
          <Paragraph typography="t7" style={{ margin: 0 }}>
            <Paragraph.Text color="gray">{today}</Paragraph.Text>
          </Paragraph>
          <Paragraph typography="t4" style={{ margin: `${spacingPx('xxs')} 0 0` }}>
            <Paragraph.Text fontWeight="bold">오늘의 카드</Paragraph.Text>
          </Paragraph>
        </header>
        <CardDeckPicker onConfirm={pickCard} />
      </div>
    );
  }

  /* 이미 픽된 상태에서 마운트 → 위 useEffect 가 즉시 /detail 로 보냄. 그 사이 빈 화면 방지용 카드 표시 */
  return (
    <div className="page-home">
      <div className="page-home-card">
        <CardReveal card={card} revealed={revealed} onReveal={revealCard} />
      </div>
    </div>
  );
}
