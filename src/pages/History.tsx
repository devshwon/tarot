import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Paragraph } from '@toss/tds-mobile';
import { formatHistoryDate, getHistory, MAX_HISTORY_DAYS } from '@/utils/storage';
import { getConsultSessions } from '@/services/consultSession';
import { findCategory } from '@/data/consultCategories';
import { tarotCards } from '@/utils/tarotData';
import PageStateView from '@/components/PageStateView';
import BannerAd from '@/components/BannerAd';
import CardThumb from '@/components/CardThumb';
import { spacingPx } from '@/design/tokens';
import type { HistoryEntry } from '@/types/tarot';
import type { ConsultSession } from '@/types/consult';
import type { PageState } from '@/types/pageState';

type HistoryItem =
  | { kind: 'card'; entry: HistoryEntry; sortKey: number; key: string }
  | { kind: 'session'; session: ConsultSession; sortKey: number; key: string };

function buildItems(): HistoryItem[] {
  const cards = getHistory();
  const sessions = getConsultSessions();
  const cardItems: HistoryItem[] = cards.map((entry, i) => ({
    kind: 'card',
    entry,
    sortKey: new Date(entry.date + 'T00:00:00').getTime(),
    key: `card-${entry.date}-${entry.cardId}-${i}`,
  }));
  const sessionItems: HistoryItem[] = sessions.map((session) => ({
    kind: 'session',
    session,
    sortKey: session.createdAt,
    key: `session-${session.id}`,
  }));
  return [...cardItems, ...sessionItems].sort((a, b) => b.sortKey - a.sortKey);
}

export default function HistoryPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [pageState, setPageState] = useState<PageState>('loading');
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const list = buildItems();
    setItems(list);
    setPageState(list.length === 0 ? 'empty' : 'success');
  }, [pathname]);

  const bannerAfterIndex = useMemo(
    () => Math.max(0, Math.floor(items.length / 2) - 1),
    [items.length]
  );

  return (
    <PageStateView
      state={pageState}
      config={{
        loading: { message: '기록을 불러오는 중…' },
        empty: {
          icon: '🕐',
          message: '아직 기록이 없습니다',
          subMessage: '오늘의 카드를 뽑거나 타로 상담을 받아 보세요!',
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
            <Paragraph.Text color="gray">
              최근 {MAX_HISTORY_DAYS}일간의 카드 기록 · 타로 상담 세션
            </Paragraph.Text>
          </Paragraph>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: spacingPx('sm') }}>
          {items.map((item, index) => (
            <React.Fragment key={item.key}>
              {item.kind === 'card' ? (
                <CardHistoryRow
                  entry={item.entry}
                  onClick={() =>
                    navigate('/detail', {
                      state: {
                        fromHistory: true,
                        card: tarotCards.find((c) => c.id === item.entry.cardId),
                        date: item.entry.date,
                        question: item.entry.question,
                      },
                    })
                  }
                />
              ) : (
                <SessionHistoryRow
                  session={item.session}
                  onClick={() =>
                    navigate('/consult-detail', { state: { sessionId: item.session.id } })
                  }
                />
              )}
              {index === bannerAfterIndex && (
                <div style={{ width: '100%', margin: `${spacingPx('md')} 0` }}>
                  <BannerAd />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </PageStateView>
  );
}

function CardHistoryRow({ entry, onClick }: { entry: HistoryEntry; onClick: () => void }) {
  const card = tarotCards.find((c) => c.id === entry.cardId);
  if (!card) return null;
  const truncQ =
    entry.question != null && entry.question !== ''
      ? ` · "${entry.question.length > 12 ? entry.question.slice(0, 12) + '…' : entry.question}"`
      : '';
  return (
    <button
      type="button"
      className="glass-card section-card history-item history-item-button"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: spacingPx('md'),
        width: '100%',
        textAlign: 'left',
        cursor: 'pointer',
      }}
      onClick={onClick}
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
            {truncQ}
          </Paragraph.Text>
        </Paragraph>
      </div>
      {entry.unlocked && (
        <span className="history-badge-unlocked" aria-hidden>
          상세 확인
        </span>
      )}
    </button>
  );
}

function SessionHistoryRow({
  session,
  onClick,
}: {
  session: ConsultSession;
  onClick: () => void;
}) {
  const category = findCategory(session.categoryId);
  const emoji = category?.emoji ?? '🔮';
  const firstQ = session.turns[0]?.question ?? '';
  const truncQ = firstQ.length > 16 ? firstQ.slice(0, 16) + '…' : firstQ;
  return (
    <button
      type="button"
      className="glass-card section-card history-item history-item-button"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: spacingPx('md'),
        width: '100%',
        textAlign: 'left',
        cursor: 'pointer',
      }}
      onClick={onClick}
      aria-label={`${session.categoryLabel} 상담 세션 ${formatHistoryDate(session.date)} 상세 보기`}
    >
      <span
        aria-hidden
        style={{
          fontSize: spacingPx('xxl'),
          lineHeight: 1,
          width: 48,
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {emoji}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Paragraph typography="t6" style={{ margin: 0 }}>
          <Paragraph.Text fontWeight="bold">
            {session.categoryLabel} 상담
          </Paragraph.Text>
        </Paragraph>
        <Paragraph typography="t7" style={{ margin: 0 }}>
          <Paragraph.Text color="gray">
            {formatHistoryDate(session.date)} · {session.turns.length}턴
            {truncQ ? ` · "${truncQ}"` : ''}
          </Paragraph.Text>
        </Paragraph>
      </div>
      <span className="history-badge-unlocked" aria-hidden>
        상담
      </span>
    </button>
  );
}
