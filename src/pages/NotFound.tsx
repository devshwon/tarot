import { useNavigate } from 'react-router-dom';
import { Button, Paragraph } from '@toss/tds-mobile';
import { spacingPx } from '@/design/tokens';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: spacingPx('md'), textAlign: 'center' }}>
      <p style={{ fontSize: spacingPx('xxxxl'), margin: 0 }} aria-hidden>🔮</p>
      <Paragraph typography="t5" style={{ margin: 0 }}>
        <Paragraph.Text fontWeight="bold">페이지를 찾을 수 없습니다</Paragraph.Text>
      </Paragraph>
      <Button color="primary" variant="fill" display="inline" onClick={() => navigate('/')}>
        홈으로
      </Button>
    </div>
  );
}
