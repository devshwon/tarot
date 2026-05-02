import { useState, useEffect, useRef } from 'react';
import { Button, Paragraph, TextArea } from '@toss/tds-mobile';
import { getTodayString } from '@/utils/dailyCard';
import type { TarotCard } from '@/types/tarot';
import PageStateView from '@/components/PageStateView';
import CardThumb from '@/components/CardThumb';
import CardDeckPicker from '@/components/CardDeckPicker';
import { spacingPx } from '@/design/tokens';
import type { PageState } from '@/types/pageState';
import { GptTarotService } from '@/services/gptTarot';
import { AdService } from '@/services/adService';
import {
  getHistory,
  getShareRewardCount,
  saveToHistory,
  updateHistoryGptDetail,
  useShareRewardCredit,
} from '@/utils/storage';

const MIN_QUESTION_LENGTH = 2;
const MAX_QUESTION_LENGTH = 100;
const QUESTION_TEXTAREA_MIN_HEIGHT = 220;

/** 앞뒤 공백 제거, 연속 공백 하나로 */
function normalizeQuestion(raw: string): string {
  return raw.trim().replace(/\s{2,}/g, ' ');
}

type AskStage = 'input' | 'pick' | 'result';

export default function AskPage() {
  const [question, setQuestion] = useState('');
  const [stage, setStage] = useState<AskStage>('input');
  const [result, setResult] = useState<TarotCard | null>(null);
  const [detailUnlocked, setDetailUnlocked] = useState(false);
  const [gptLoading, setGptLoading] = useState(false);
  const [gptDetail, setGptDetail] = useState<string | null>(null);
  const [shareRewardCount, setShareRewardCount] = useState(getShareRewardCount);
  const mountedRef = useRef(true);
  const activeCtrlRef = useRef<AbortController | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const normalized = normalizeQuestion(question);
  const canSubmit = normalized.length >= MIN_QUESTION_LENGTH;
  const isAtMaxLength = question.length >= MAX_QUESTION_LENGTH;

  useEffect(() => {
    setShareRewardCount(getShareRewardCount());
    if (!result || normalized.length === 0) return;
    const entry = getHistory().find(
      (h) => h.date === getTodayString() && h.question === normalized
    );
    if (entry?.gptDetail != null) {
      setGptDetail(entry.gptDetail);
      setDetailUnlocked(true);
    }
  }, [result?.id, normalized]);

  const handleSubmit = () => {
    if (!canSubmit || normalized.length < MIN_QUESTION_LENGTH) return;
    setDetailUnlocked(false);
    setGptDetail(null);
    setStage('pick');
  };

  const handlePickConfirm = (card: TarotCard) => {
    setResult(card);
    saveToHistory({
      date: getTodayString(),
      cardId: card.id,
      question: normalized,
      unlocked: false,
    });
    setStage('result');
  };

  const handleReset = () => {
    setQuestion('');
    setResult(null);
    setStage('input');
    setDetailUnlocked(false);
    setGptDetail(null);
  };

  const handleUnlockDetail = () => {
    if (!result || gptLoading) return;
    setGptLoading(true);

    const card = result;
    const ctrl = new AbortController();
    activeCtrlRef.current = ctrl;
    const fetchPromise = GptTarotService.getTarotInterpretation(card, normalized, ctrl.signal);
    let aborted = false;

    const isAlive = () => mountedRef.current && !aborted;

    const reveal = async () => {
      if (!isAlive()) return;
      setDetailUnlocked(true);
      try {
        const text = await fetchPromise;
        if (!isAlive()) return;
        setGptDetail(text);
        updateHistoryGptDetail(getTodayString(), text, normalized);
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        throw e;
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
  };

  const handleUnlockWithCredit = () => {
    if (!result || gptLoading) return;
    if (!useShareRewardCredit()) return;
    setShareRewardCount(getShareRewardCount());
    setDetailUnlocked(true);
    setGptLoading(true);
    GptTarotService.getTarotInterpretation(result, normalized)
      .then((text) => {
        setGptDetail(text);
        updateHistoryGptDetail(getTodayString(), text, normalized);
      })
      .finally(() => setGptLoading(false));
  };

  const handleShowDetail = async () => {
    if (!result || gptLoading) return;
    setGptLoading(true);
    setGptDetail(null);
    try {
      const text = await GptTarotService.getTarotInterpretation(result, normalized);
      setGptDetail(text);
      updateHistoryGptDetail(getTodayString(), text, normalized);
    } finally {
      setGptLoading(false);
    }
  };

  const canUseGptDetail = GptTarotService.isConfigured();

  const pageState: PageState = 'success';

  return (
    <PageStateView
      state={pageState}
      config={{
        loading: { message: '카드를 뽑는 중…' },
        empty: { message: '질문을 입력해 주세요.', subMessage: '마음속 고민을 적어 보세요.' },
        error: { message: '오류가 발생했습니다.', retryLabel: '다시 시도', onRetry: handleReset, backLabel: '돌아가기', onBack: () => window.history.back() },
      }}
    >
      <div className="page-ask" style={{ display: 'flex', flexDirection: 'column', gap: spacingPx('xl'), width: '100%', minWidth: 0, maxWidth: '100%' }}>
      <header style={{ marginBottom: spacingPx('xs') }}>
        <Paragraph typography="t4" style={{ margin: 0 }}>
          <Paragraph.Text fontWeight="bold">질문하기</Paragraph.Text>
        </Paragraph>
        <Paragraph typography="t6" style={{ marginTop: spacingPx('xxs'), marginBottom: 0 }}>
          <Paragraph.Text color="gray">마음속 질문을 적어 보세요. 카드가 답할지도 모릅니다.</Paragraph.Text>
        </Paragraph>
      </header>

      {stage === 'input' ? (
        <>
          <div className="ask-question-field" style={{ display: 'flex', flexDirection: 'column', gap: spacingPx('md'), width: '100%' }}>
            <TextArea
              variant="box"
              minHeight={QUESTION_TEXTAREA_MIN_HEIGHT}
              placeholder="오늘 고민되는 것이 있나요? (2자 이상)"
              maxLength={MAX_QUESTION_LENGTH}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              aria-label="질문 입력"
              style={{ width: '100%', boxSizing: 'border-box', maxWidth: '100%' }}
            />
            <Paragraph typography="t7" style={{ margin: 0 }}>
              <Paragraph.Text color="gray">
                {question.length}/{MAX_QUESTION_LENGTH}자
                {isAtMaxLength && ' (최대)'}
              </Paragraph.Text>
            </Paragraph>
            {normalized.length > 0 && normalized.length < MIN_QUESTION_LENGTH && (
              <Paragraph typography="t7" style={{ margin: 0 }}>
                <Paragraph.Text color="gray">질문은 {MIN_QUESTION_LENGTH}자 이상 입력해 주세요.</Paragraph.Text>
              </Paragraph>
            )}
            <Paragraph typography="t7" style={{ margin: 0, textAlign: 'center', whiteSpace: 'pre-line' }}>
              <Paragraph.Text color="gray">
                {'같은 질문을 반복하면 답이 흐려질 수 있어요.\n오늘은 한 번만 깊게 물어 보세요.'}
              </Paragraph.Text>
            </Paragraph>
            <Button
              color="primary"
              variant="fill"
              display="block"
              onClick={handleSubmit}
              disabled={!canSubmit}
              style={{ width: '100%' }}
            >
              카드 뽑기
            </Button>
          </div>
        </>
      ) : stage === 'pick' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacingPx('md'), width: '100%' }}>
          <div className="glass-card section-card" style={{ width: '100%' }} role="region" aria-label="입력한 질문">
            <Paragraph typography="t7" style={{ margin: 0 }}>
              <Paragraph.Text color="gray" fontWeight="bold">질문</Paragraph.Text>
            </Paragraph>
            <Paragraph typography="t6" style={{ marginTop: spacingPx('xxs'), marginBottom: 0, lineHeight: 1.6 }}>
              <Paragraph.Text>{'"'}{normalized}{'"'}</Paragraph.Text>
            </Paragraph>
          </div>
          <CardDeckPicker onConfirm={handlePickConfirm} />
          <Button color="dark" variant="weak" display="block" onClick={handleReset} style={{ width: '100%' }}>
            질문 다시 쓰기
          </Button>
        </div>
      ) : result ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: spacingPx('lg') }}>
          {/* 질문 원문 */}
          <div className="glass-card section-card" style={{ width: '100%' }} role="region" aria-label="입력한 질문">
            <Paragraph typography="t7" style={{ margin: 0 }}>
              <Paragraph.Text color="gray" fontWeight="bold">질문</Paragraph.Text>
            </Paragraph>
            <Paragraph typography="t6" style={{ marginTop: spacingPx('xxs'), marginBottom: 0, lineHeight: 1.6 }}>
              <Paragraph.Text>{'"'}{normalized}{'"'}</Paragraph.Text>
            </Paragraph>
          </div>

          {/* 카드 요약 해석 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacingPx('md'), width: '100%' }} role="region" aria-label="카드 해석">
            <div className="glass-card section-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacingPx('md') }}>
              <CardThumb card={result} size={80} emojiFontSize={spacingPx('xxxxl')} />
              <Paragraph typography="t5" style={{ margin: 0 }}>
                <Paragraph.Text fontWeight="bold">{result.nameKo}</Paragraph.Text>
              </Paragraph>
              <Paragraph typography="t7" style={{ margin: 0 }}>
                <Paragraph.Text color="gray">{result.name}</Paragraph.Text>
              </Paragraph>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: spacingPx('xxs') }}>
                {result.keywords.map((kw) => (
                  <span key={kw} className="card-keyword">{kw}</span>
                ))}
              </div>
            </div>
          </div>

          {/* 광고 후 카드 해석 플로우 */}
          {!detailUnlocked && !gptLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacingPx('xs'), width: '100%' }}>
              {shareRewardCount > 0 && (
                <Button color="primary" variant="fill" display="block" onClick={handleUnlockWithCredit} style={{ width: '100%' }}>
                  해석권으로 카드 해석 보기 ({shareRewardCount}개 보유)
                </Button>
              )}
              <Button
                color="primary"
                variant={shareRewardCount > 0 ? 'weak' : 'fill'}
                display="block"
                onClick={handleUnlockDetail}
                style={{ width: '100%' }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacingPx('xs') }} aria-hidden>
                  <span style={{ fontSize: '1.1em' }}>🔒</span>
                  광고 보고 카드 해석 보기
                </span>
              </Button>
            </div>
          ) : canUseGptDetail ? (
            <>
              {gptDetail !== null ? (
                <div className="glass-card section-card" style={{ width: '100%' }}>
                  <Paragraph typography="t7" style={{ margin: `0 0 ${spacingPx('sm')}` }}>
                    <Paragraph.Text fontWeight="bold">카드 해석</Paragraph.Text>
                  </Paragraph>
                  <Paragraph typography="t6" style={{ margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    <Paragraph.Text>{gptDetail}</Paragraph.Text>
                  </Paragraph>
                </div>
              ) : gptLoading ? (
                <div className="glass-card section-card" style={{ width: '100%', textAlign: 'center', padding: spacingPx('xl'), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacingPx('md') }}>
                  <div className="page-state-loading-spinner" style={{ width: 32, height: 32 }} role="status" aria-label="로딩 중" />
                  <Paragraph typography="t7" style={{ margin: 0 }}>
                    <Paragraph.Text color="gray">카드와 질문을 바탕으로 해석하고 있어요…</Paragraph.Text>
                  </Paragraph>
                </div>
              ) : (
                <Button color="primary" variant="fill" display="block" onClick={handleShowDetail} style={{ width: '100%' }}>
                  카드 해석 보기
                </Button>
              )}
            </>
          ) : (
            <div className="glass-card section-card" style={{ width: '100%' }}>
              <Paragraph typography="t7" style={{ margin: 0 }}>
                <Paragraph.Text color="gray">카드 해석을 사용하려면 API 키를 설정해 주세요.</Paragraph.Text>
              </Paragraph>
            </div>
          )}

          <Paragraph typography="t7" style={{ margin: 0, textAlign: 'center' }}>
            <Paragraph.Text color="gray">
              한 번 뽑힌 카드는 다시 뽑아도 같은 마음에 닿지 않아요. 오늘은 이 카드와 머물러 보세요.
            </Paragraph.Text>
          </Paragraph>

          <Button color="dark" variant="weak" display="block" onClick={handleReset} style={{ width: '100%' }}>
            다른 질문하기
          </Button>
        </div>
      ) : null}

      <Paragraph typography="t7" style={{ textAlign: 'center' }}>
        <Paragraph.Text color="gray">카드의 답변은 오락 목적이며, 실질적 조언이 아닙니다.</Paragraph.Text>
      </Paragraph>
      </div>
    </PageStateView>
  );
}
