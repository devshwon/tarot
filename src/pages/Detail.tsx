import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Paragraph, useToast } from '@toss/tds-mobile';
import { useDailyCard } from '@/hooks/useDailyCard';
import PageStateView from '@/components/PageStateView';
import CardThumb from '@/components/CardThumb';
import BannerAd from '@/components/BannerAd';
import ConsultEntryCard from '@/components/ConsultEntryCard';
import { spacingPx } from '@/design/tokens';
import type { PageState } from '@/types/pageState';
import type { TarotCard } from '@/types/tarot';
import { GptTarotService, SERVICE_UNAVAILABLE_MESSAGE } from '@/services/gptTarot';
import { AdService } from '@/services/adService';
import { getHistory, getShareRewardCount, updateHistoryGptDetail, useShareRewardCredit } from '@/utils/storage';
import { buildDailyCardShareText, SHARE_MESSAGES, shareText } from '@/utils/share';

type DetailLocationState = { fromHistory?: true; card: TarotCard; date: string; question?: string | null } | null;

export default function DetailPage() {
  const { card: dailyCard, today } = useDailyCard();
  const location = useLocation();
  const navigate = useNavigate();
  const stateFromHistory = (location.state as DetailLocationState);
  const isFromHistory = stateFromHistory?.fromHistory === true && stateFromHistory?.card != null;
  const card = isFromHistory ? stateFromHistory.card : dailyCard;
  const detailDate = isFromHistory ? stateFromHistory!.date : today;
  const detailQuestion = stateFromHistory?.question ?? null;

  const [gptDetail, setGptDetail] = useState<string | null>(() => {
    const entry = getHistory().find(
      (h) => h.date === detailDate && (detailQuestion != null ? h.question === detailQuestion : (h.question == null || h.question === ''))
    );
    return entry?.gptDetail ?? null;
  });
  const [gptLoading, setGptLoading] = useState(false);
  const [gptError, setGptError] = useState(false);
  const [shareRewardCount, setShareRewardCount] = useState(getShareRewardCount);
  const toast = useToast();
  const mountedRef = useRef(true);
  const activeCtrlRef = useRef<AbortController | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const runGptFetch = () => {
    if (!card || gptLoading) return;
    setGptError(false);
    setGptLoading(true);
    const ctrl = new AbortController();
    activeCtrlRef.current = ctrl;
    GptTarotService.getTarotInterpretation(card, detailQuestion ?? undefined, ctrl.signal)
      .then((text) => {
        if (!mountedRef.current) return;
        if (text === SERVICE_UNAVAILABLE_MESSAGE) {
          setGptError(true);
          return;
        }
        setGptDetail(text);
        updateHistoryGptDetail(detailDate, text, detailQuestion);
      })
      .catch((e) => {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        if (mountedRef.current) setGptError(true);
      })
      .finally(() => {
        if (mountedRef.current) setGptLoading(false);
      });
  };

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      activeCtrlRef.current?.abort();
      if (retryTimerRef.current != null) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const entry = getHistory().find(
      (h) => h.date === detailDate && (detailQuestion != null ? h.question === detailQuestion : (h.question == null || h.question === ''))
    );
    setGptDetail(entry?.gptDetail ?? null);
    setShareRewardCount(getShareRewardCount());
  }, [detailDate, detailQuestion]);

  const state: PageState = card == null ? 'empty' : 'success';

  if (state !== 'success') {
    return (
      <PageStateView
        state={state}
        config={{
          empty: {
            message: '오늘의 카드가 아직 없습니다.',
            subMessage: '먼저 오늘의 카드를 한 장 골라 주세요.',
            actionLabel: '오늘의 카드 고르러 가기',
            onAction: () => navigate('/'),
          },
          error: { message: '불러오기에 실패했습니다.', subMessage: '잠시 후 다시 시도해 주세요.', retryLabel: '다시 시도', onRetry: () => window.location.reload(), backLabel: '돌아가기', onBack: () => navigate('/') },
        }}
      >
        {null}
      </PageStateView>
    );
  }

  if (!card) return null;

  /* 카드 정보 → 상세 해석 → 조언 → 행운 정보 → 추가 해석(광고 시청 시) */
  return (
    <div className="detail-unlocked" style={{ display: 'flex', flexDirection: 'column', gap: spacingPx('lg') }}>
      {/* 0. 타로 상담 진입 */}
      <ConsultEntryCard />

      {/* 1. 카드 정보 */}
      <div className="glass-card section-card" style={{ display: 'flex', alignItems: 'center', gap: spacingPx('md') }}>
        <CardThumb card={card} size={80} emojiFontSize={spacingPx('xxxxl')} />
        <div>
          <Paragraph typography="t5" style={{ margin: 0 }}>
            <Paragraph.Text fontWeight="bold">{card.nameKo}</Paragraph.Text>
          </Paragraph>
          <Paragraph typography="t7" style={{ margin: 0 }}>
            <Paragraph.Text color="gray">{card.name}</Paragraph.Text>
          </Paragraph>
        </div>
      </div>

      {/* 2. 상세 해석 */}
      <div className="glass-card section-card">
        <Paragraph typography="t7" style={{ margin: `0 0 ${spacingPx('sm')}` }}>
          <Paragraph.Text fontWeight="bold">상세 해석</Paragraph.Text>
        </Paragraph>
        <Paragraph typography="t6" style={{ margin: 0, lineHeight: 1.6 }}>
          <Paragraph.Text>{card.detailedReading}</Paragraph.Text>
        </Paragraph>
      </div>

      {/* 3. 오늘의 조언 */}
      <div className="glass-card section-card">
        <Paragraph typography="t7" style={{ margin: `0 0 ${spacingPx('xs')}` }}>
          <Paragraph.Text fontWeight="bold">💡 오늘의 조언</Paragraph.Text>
        </Paragraph>
        <Paragraph typography="t6" style={{ margin: 0 }}>
          <Paragraph.Text>{card.advice}</Paragraph.Text>
        </Paragraph>
      </div>

      {/* 4. 행운 정보 */}
      <div style={{ display: 'flex', gap: spacingPx('sm') }}>
        <div className="glass-card section-card" style={{ flex: 1, textAlign: 'center' }}>
          <Paragraph typography="t7" style={{ margin: 0 }}>
            <Paragraph.Text color="gray">행운의 색</Paragraph.Text>
          </Paragraph>
          <Paragraph typography="t6" style={{ margin: `${spacingPx('xxs')} 0 0` }}>
            <Paragraph.Text fontWeight="bold">{card.luckyColor}</Paragraph.Text>
          </Paragraph>
        </div>
        <div className="glass-card section-card" style={{ flex: 1, textAlign: 'center' }}>
          <Paragraph typography="t7" style={{ margin: 0 }}>
            <Paragraph.Text color="gray">행운의 숫자</Paragraph.Text>
          </Paragraph>
          <Paragraph typography="t6" style={{ margin: `${spacingPx('xxs')} 0 0` }}>
            <Paragraph.Text fontWeight="bold">{String(card.luckyNumber)}</Paragraph.Text>
          </Paragraph>
        </div>
      </div>

      {/* 5. 광고 후 추가 해석 (AI) */}
      {GptTarotService.isConfigured() ? (
        gptDetail !== null ? (
          <div className="glass-card section-card">
            <Paragraph typography="t7" style={{ margin: `0 0 ${spacingPx('sm')}` }}>
              <Paragraph.Text fontWeight="bold">추가 해석</Paragraph.Text>
            </Paragraph>
            <Paragraph typography="t6" style={{ margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              <Paragraph.Text>{gptDetail}</Paragraph.Text>
            </Paragraph>
          </div>
        ) : gptLoading ? (
          <div className="glass-card section-card detail-gpt-loading" style={{ textAlign: 'center', padding: spacingPx('xl') }}>
            <div className="page-state-loading-spinner" style={{ width: 32, height: 32, margin: '0 auto', marginBottom: spacingPx('sm') }} aria-hidden />
            <Paragraph typography="t7" style={{ margin: 0 }}>
              <Paragraph.Text color="gray">카드와 질문을 바탕으로 해석하고 있어요…</Paragraph.Text>
            </Paragraph>
          </div>
        ) : gptError ? (
          <div className="glass-card section-card" style={{ display: 'flex', flexDirection: 'column', gap: spacingPx('sm') }}>
            <Paragraph typography="t7" style={{ margin: 0, textAlign: 'center' }}>
              <Paragraph.Text color="gray">{SERVICE_UNAVAILABLE_MESSAGE}</Paragraph.Text>
            </Paragraph>
            <Button color="primary" variant="fill" display="block" style={{ width: '100%' }} onClick={runGptFetch}>
              다시 시도
            </Button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacingPx('xs'), width: '100%' }}>
            {shareRewardCount > 0 && (
              <Button
                color="primary"
                variant="fill"
                display="block"
                style={{ width: '100%' }}
                onClick={() => {
                  if (!card || gptLoading) return;
                  if (!useShareRewardCredit()) return;
                  setShareRewardCount(getShareRewardCount());
                  runGptFetch();
                }}
              >
                해석권 1개 사용하고 보기 ({shareRewardCount}개 보유)
              </Button>
            )}
            <Button
              color="primary"
              variant={shareRewardCount > 0 ? 'weak' : 'fill'}
              display="block"
              style={{ width: '100%' }}
              onClick={() => {
                if (!card || gptLoading) return;
                setGptLoading(true);

                const ctrl = new AbortController();
                activeCtrlRef.current = ctrl;
                const fetchPromise = GptTarotService.getTarotInterpretation(
                  card,
                  detailQuestion ?? undefined,
                  ctrl.signal,
                );
                let aborted = false;

                const isAlive = () => mountedRef.current && !aborted;

                const reveal = async () => {
                  if (!isAlive()) return;
                  try {
                    const text = await fetchPromise;
                    if (!isAlive()) return;
                    if (text === SERVICE_UNAVAILABLE_MESSAGE) {
                      setGptError(true);
                      return;
                    }
                    setGptDetail(text);
                    updateHistoryGptDetail(detailDate, text, detailQuestion);
                  } catch (e) {
                    if (e instanceof DOMException && e.name === 'AbortError') return;
                    if (isAlive()) setGptError(true);
                  } finally {
                    if (isAlive()) setGptLoading(false);
                  }
                };

                const RETRY_BACKOFF_MS = 500;
                const tryShowAd = (retriesLeft: number) => {
                  if (!isAlive()) return;
                  AdService.showRewardedAd({
                    onRewarded: () => { void reveal(); },
                    onDismiss: () => {
                      aborted = true;
                      ctrl.abort();
                      if (retryTimerRef.current != null) {
                        clearTimeout(retryTimerRef.current);
                        retryTimerRef.current = null;
                      }
                      if (mountedRef.current) setGptLoading(false);
                    },
                    onFailed: () => {
                      if (retriesLeft > 0) {
                        retryTimerRef.current = setTimeout(() => {
                          retryTimerRef.current = null;
                          tryShowAd(retriesLeft - 1);
                        }, RETRY_BACKOFF_MS);
                      } else {
                        void reveal();
                      }
                    },
                  });
                };

                tryShowAd(2);
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacingPx('xs') }} aria-hidden>
                <span style={{ fontSize: '1.1em' }}>🔒</span>
                광고 보고 추가 해석 보기
              </span>
            </Button>
          </div>
        )
      ) : null}

      {/* 6. 공유 */}
      <Button color="dark" variant="weak" display="block" onClick={handleShare} aria-label="결과 공유" style={{ width: '100%' }}>
        공유
      </Button>

      <Paragraph typography="t7" style={{ textAlign: 'center' }}>
        <Paragraph.Text color="gray">오락 목적이며, 결정의 근거로 사용할 수 없습니다. 면책 조항은 설정에서 확인할 수 있습니다.</Paragraph.Text>
      </Paragraph>

      <div style={{ width: '100%' }}>
        <BannerAd />
      </div>
    </div>
  );
}
