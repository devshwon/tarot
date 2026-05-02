import { useNavigate } from 'react-router-dom';
import { Button, Paragraph, useToast } from '@toss/tds-mobile';
import { useDailyCard } from '@/hooks/useDailyCard';
import CardReveal from '@/components/CardReveal';
import CardDeckPicker from '@/components/CardDeckPicker';
import { buildDailyCardShareText, SHARE_MESSAGES, shareText } from '@/utils/share';
import { spacingPx } from '@/design/tokens';

export default function HomePage() {
  const { card, hasPicked, revealed, revealCard, unlocked, unlock, today, pickCard } = useDailyCard();
  const navigate = useNavigate();
  const toast = useToast();

  const handleShare = async () => {
    if (!card) return;
    const text = buildDailyCardShareText(card);
    const result = await shareText(text);
    if (result.success) {
      toast.openToast(result.method === 'share' ? SHARE_MESSAGES.successShare : SHARE_MESSAGES.successCopy);
    } else {
      toast.openToast(result.method === 'share' ? SHARE_MESSAGES.failShare : SHARE_MESSAGES.failCopy);
    }
  };

  const goDetail = () => {
    if (!unlocked) unlock();
    navigate('/detail');
  };

  if (!hasPicked || card == null) {
    return (
      <div className="page-home">
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

  return (
    <div className="page-home">
      <header className="page-home-header" style={{ textAlign: 'center' }}>
        <Paragraph typography="t7" style={{ margin: 0 }}>
          <Paragraph.Text color="gray">{today}</Paragraph.Text>
        </Paragraph>
        <Paragraph typography="t4" style={{ margin: `${spacingPx('xxs')} 0 0` }}>
          <Paragraph.Text fontWeight="bold">오늘의 카드</Paragraph.Text>
        </Paragraph>
      </header>

      <div className="page-home-card">
        <CardReveal card={card} revealed={revealed} onReveal={revealCard} />
      </div>

      <div className="page-home-content" style={{ width: '100%', paddingLeft: 0, paddingRight: 0 }}>
        {revealed ? (
          <div className="glass-card section-card" style={{ width: '100%' }}>
            <Paragraph typography="t6" style={{ margin: 0, lineHeight: 1.6 }}>
              <Paragraph.Text>{card.shortReading}</Paragraph.Text>
            </Paragraph>
            <div style={{ marginTop: spacingPx('md'), display: 'flex', flexDirection: 'column', gap: spacingPx('xs') }}>
              <Button
                color="primary"
                variant="fill"
                display="block"
                onClick={goDetail}
                style={{ width: '100%' }}
              >
                {unlocked ? '상세 해석 보기' : '광고 보고 상세 해석 보기'}
              </Button>
              <Button color="dark" variant="weak" display="block" onClick={handleShare} aria-label="결과 공유" style={{ width: '100%' }}>
                공유
              </Button>
            </div>
          </div>
        ) : (
          <Paragraph typography="t7" style={{ margin: 0, textAlign: 'center' }}>
            <Paragraph.Text color="gray">카드를 탭해 오늘의 메시지를 확인하세요.</Paragraph.Text>
          </Paragraph>
        )}
      </div>
    </div>
  );
}
