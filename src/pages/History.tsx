import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Paragraph } from '@toss/tds-mobile';
import { formatHistoryDate, getHistory, MAX_HISTORY_DAYS } from '@/utils/storage';
import { tarotCards } from '@/utils/tarotData';
import PageStateView from '@/components/PageStateView';
import BannerAd from '@/components/BannerAd';
import CardThumb from '@/components/CardThumb';
import { spacingPx } from '@/design/tokens';
import type { HistoryEntry } from '@/types/tarot';
import type { PageState } from '@/types/pageState';

function loadHistoryFromStorage(): HistoryEntry[] {
  try {
    return getHistory();
  } catch {
    return [];
  }
}

export default function HistoryPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [pageState, setPageState] = useState<PageState>('loading');
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const list = loadHistoryFromStorage();
    setHistory(list);
    setPageState(list.length === 0 ? 'empty' : 'success');
  }, [pathname]);

  return (
    <PageStateView
      state={pageState}
      config={{
        loading: { message: '기록을 불러오는 중…' },
        empty: {
          icon: '🕐',
          message: '아직 기록이 없습니다',
          subMessage: '오늘의 카드를 뽑아 보세요!',
          actionLabel: '오늘의 카드 보러가기',
          onAction: () => navigate('/'),
        },
        error: {
          message: '기록을 불러오지 못했습니다.',
          subMessage: '잠시 후 다시 시도해 주세요.',
          retryLabel: '다시 시도',
          onRetry: () => window.location.reload(),
          backLabel: '홈으로',
          onBack: () => navigate('/'),
        },
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacingPx('lg') }}>
        <header>
          <Paragraph typography="t4" style={{ margin: 0 }}>
            <Paragraph.Text fontWeight="bold">기록</Paragraph.Text>
          </Paragraph>
          <Paragraph typography="t6" style={{ marginTop: spacingPx('xxs') }}>
            <Paragraph.Text color="gray">최근 {MAX_HISTORY_DAYS}일간의 카드 기록</Paragraph.Text>
          </Paragraph>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: spacingPx('sm') }}>
          {history.map((entry, index) => {
            const card = tarotCards.find((c) => c.id === entry.cardId);
            if (!card) return null;
            const listKey = entry.question != null ? `${entry.date}-${entry.cardId}-${index}` : entry.date;
            const bannerAfterIndex = Math.max(0, Math.floor(history.length / 2) - 1);
            return (
              <React.Fragment key={listKey}>
                <button
                  type="button"
                  className="glass-card section-card history-item history-item-button"
                  style={{ display: 'flex', alignItems: 'center', gap: spacingPx('md'), width: '100%', textAlign: 'left', cursor: 'pointer' }}
                  onClick={() => navigate('/detail', { state: { fromHistory: true, card, date: entry.date, question: entry.question } })}
                  aria-label={`${card.nameKo} ${formatHistoryDate(entry.date)} 상세 보기`}
                >
                  <CardThumb card={card} size={48} emojiFontSize={spacingPx('xxl')} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Paragraph typography="t6" style={{ margin: 0 }}>
                      <Paragraph.Text fontWeight="bold">{card.nameKo}</Paragraph.Text>
                    </Paragraph>
                    <Paragraph typography="t7" style={{ margin: 0 }}>
                      <Paragraph.Text color="gray">
                        {formatHistoryDate(entry.date)}
                        {entry.question != null && entry.question !== '' && ` · "${entry.question.length > 12 ? entry.question.slice(0, 12) + '…' : entry.question}"`}
                      </Paragraph.Text>
                    </Paragraph>
                  </div>
                  {entry.unlocked && (
                    <span className="history-badge-unlocked" aria-hidden>
                      상세 확인
                    </span>
                  )}
                </button>
                {index === bannerAfterIndex && (
                  <div style={{ width: '100%', margin: `${spacingPx('md')} 0` }}>
                    <BannerAd />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </PageStateView>
  );
}
