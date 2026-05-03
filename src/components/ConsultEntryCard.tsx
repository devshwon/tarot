import { useNavigate } from 'react-router-dom';
import { Button, Paragraph } from '@toss/tds-mobile';
import { spacingPx, radiusPx } from '@/design/tokens';

export default function ConsultEntryCard() {
  const navigate = useNavigate();

  return (
    <section
      aria-label="타로 상담"
      className="glass-card consult-entry-card"
      style={{
        width: '100%',
        padding: spacingPx('lg'),
        borderRadius: radiusPx('xl'),
        display: 'flex',
        flexDirection: 'column',
        gap: spacingPx('sm'),
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: spacingPx('xs') }}>
        <span aria-hidden style={{ fontSize: spacingPx('lg'), lineHeight: 1 }}>🔮</span>
        <Paragraph typography="t5" style={{ margin: 0 }}>
          <Paragraph.Text fontWeight="bold">타로 상담</Paragraph.Text>
        </Paragraph>
      </div>
      <Paragraph typography="t7" style={{ margin: 0, lineHeight: 1.6 }}>
        <Paragraph.Text color="gray">
          연애·금전·진로·인간관계·선택. 카테고리를 정하고, 카드와 이야기 나누듯 깊게 물어보세요.
        </Paragraph.Text>
      </Paragraph>
      <Button
        color="primary"
        variant="fill"
        display="block"
        onClick={() => navigate('/consult')}
        style={{ width: '100%', marginTop: spacingPx('xxs') }}
      >
        상담 시작하기
      </Button>
    </section>
  );
}
