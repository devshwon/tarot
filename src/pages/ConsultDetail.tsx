import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Paragraph } from '@toss/tds-mobile';
import PageStateView from '@/components/PageStateView';
import CardThumb from '@/components/CardThumb';
import { spacingPx, radiusPx } from '@/design/tokens';
import type { PageState } from '@/types/pageState';
import type { ConsultSession, ConsultSessionTurn } from '@/types/consult';
import { tarotCards } from '@/utils/tarotData';
import { getConsultSession } from '@/services/consultSession';
import { formatHistoryDate } from '@/utils/storage';

function lookupCard(id: number) {
  return tarotCards.find((c) => c.id === id);
}

export default function ConsultDetailPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const sessionId = (state as { sessionId?: string } | null)?.sessionId;

  const [pageState, setPageState] = useState<PageState>('loading');
  const [session, setSession] = useState<ConsultSession | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setPageState('empty');
      return;
    }
    const found = getConsultSession(sessionId);
    if (!found) {
      setPageState('empty');
      return;
    }
    setSession(found);
    setPageState('success');
  }, [sessionId]);

  return (
    <PageStateView
      state={pageState}
      config={{
        loading: { message: '세션을 불러오는 중…' },
        empty: {
          icon: '📭',
          message: '세션을 찾을 수 없어요',
          subMessage: '기록에서 다시 선택해 주세요.',
          actionLabel: '기록으로',
          onAction: () => navigate('/history'),
        },
        error: {
          message: '세션을 불러오지 못했어요.',
          retryLabel: '다시 시도',
          onRetry: () => window.location.reload(),
          backLabel: '기록으로',
          onBack: () => navigate('/history'),
        },
      }}
    >
      {session && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: spacingPx('lg'),
            width: '100%',
            minWidth: 0,
          }}
        >
          <header>
            <Paragraph typography="t7" style={{ margin: 0 }}>
              <Paragraph.Text color="gray">{formatHistoryDate(session.date)}</Paragraph.Text>
            </Paragraph>
            <Paragraph typography="t4" style={{ marginTop: spacingPx('xxs'), marginBottom: 0 }}>
              <Paragraph.Text fontWeight="bold">
                {session.categoryLabel} 상담
              </Paragraph.Text>
            </Paragraph>
            <Paragraph typography="t7" style={{ marginTop: spacingPx('xxs'), marginBottom: 0 }}>
              <Paragraph.Text color="gray">
                {session.turns.length}번의 질문
              </Paragraph.Text>
            </Paragraph>
          </header>

          {session.turns.map((turn, i) => (
            <SessionTurnBlock key={i} turn={turn} index={i} />
          ))}

          {session.closingMessage && (
            <div className="glass-card section-card" style={{ width: '100%' }}>
              <Paragraph typography="t7" style={{ margin: 0 }}>
                <Paragraph.Text color="gray" fontWeight="bold">마무리</Paragraph.Text>
              </Paragraph>
              <Paragraph typography="t6" style={{ marginTop: spacingPx('xs'), marginBottom: 0, lineHeight: 1.6 }}>
                <Paragraph.Text>{session.closingMessage}</Paragraph.Text>
              </Paragraph>
            </div>
          )}

          <Button color="dark" variant="weak" display="block" onClick={() => navigate('/history')} style={{ width: '100%' }}>
            기록으로 돌아가기
          </Button>

          <Paragraph typography="t7" style={{ textAlign: 'center', margin: 0 }}>
            <Paragraph.Text color="gray">
              카드의 답변은 오락 목적이며, 실질적 조언이 아닙니다. 면책 조항은 설정에서 확인할 수 있습니다.
            </Paragraph.Text>
          </Paragraph>
        </div>
      )}
    </PageStateView>
  );
}

function SessionTurnBlock({ turn, index }: { turn: ConsultSessionTurn; index: number }) {
  return (
    <section
      aria-label={`${index + 1}번째 질문`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacingPx('sm'),
        width: '100%',
        padding: spacingPx('md'),
        borderRadius: radiusPx('xl'),
        background: 'rgba(255,255,255,0.04)',
      }}
    >
      <Paragraph typography="t7" style={{ margin: 0 }}>
        <Paragraph.Text color="gray" fontWeight="bold">
          {index + 1}번째 질문
        </Paragraph.Text>
      </Paragraph>

      <div className="glass-card section-card" style={{ width: '100%' }}>
        <Paragraph typography="t6" style={{ margin: 0, lineHeight: 1.6 }}>
          <Paragraph.Text>"{turn.question}"</Paragraph.Text>
        </Paragraph>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: spacingPx('xs'), width: '100%' }}>
        {turn.cards.map((c, i) => {
          const card = lookupCard(c.id);
          if (!card) return null;
          const meaning = turn.cardMeanings[i]?.meaning;
          return (
            <div
              key={`${c.id}-${i}`}
              className="glass-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: spacingPx('sm'),
                padding: spacingPx('md'),
                borderRadius: spacingPx('md'),
                width: '100%',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: spacingPx('md') }}>
                <CardThumb card={card} size={48} emojiFontSize={spacingPx('xxl')} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Paragraph typography="t7" style={{ margin: 0 }}>
                    <Paragraph.Text color="gray" fontWeight="bold">{c.position}</Paragraph.Text>
                  </Paragraph>
                  <Paragraph typography="t6" style={{ marginTop: spacingPx('xxs'), marginBottom: 0 }}>
                    <Paragraph.Text fontWeight="bold">{card.nameKo}</Paragraph.Text>
                  </Paragraph>
                </div>
              </div>
              {meaning && (
                <Paragraph typography="t7" style={{ margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  <Paragraph.Text>{meaning}</Paragraph.Text>
                </Paragraph>
              )}
            </div>
          );
        })}
      </div>

      <div className="glass-card section-card" style={{ width: '100%' }}>
        <Paragraph typography="t7" style={{ margin: 0 }}>
          <Paragraph.Text color="gray" fontWeight="bold">종합 해석</Paragraph.Text>
        </Paragraph>
        <Paragraph
          typography="t6"
          style={{ marginTop: spacingPx('xs'), marginBottom: 0, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}
        >
          <Paragraph.Text>{turn.summary}</Paragraph.Text>
        </Paragraph>
      </div>
    </section>
  );
}
