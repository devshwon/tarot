import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Paragraph, TextArea } from '@toss/tds-mobile';
import PageStateView from '@/components/PageStateView';
import CategoryPicker from '@/components/CategoryPicker';
import MultiCardDeckPicker from '@/components/MultiCardDeckPicker';
import CardThumb from '@/components/CardThumb';
import LoadingSpinner from '@/components/LoadingSpinner';
import SpreadPreviewBadge from '@/components/SpreadPreviewBadge';
import SpreadHintCard from '@/components/SpreadHintCard';
import { spacingPx, radiusPx } from '@/design/tokens';
import type { PageState } from '@/types/pageState';
import type { CategoryId, ConsultStage } from '@/types/consult';
import type { TarotCard } from '@/types/tarot';
import { findCategory, pickRandomPlaceholder } from '@/data/consultCategories';
import { decideSpread, type Spread } from '@/utils/decideSpread';
import {
  ConsultService,
  ConsultServiceError,
  type ConsultPreviousTurn,
  type ConsultTurnResult,
} from '@/services/consultService';
import { AdService } from '@/services/adService';
import { getShareRewardCount, useShareRewardCredit } from '@/utils/storage';
import { getTodayString } from '@/utils/dailyCard';
import {
  generateSessionId,
  saveConsultSession,
} from '@/services/consultSession';
import type { ConsultSession, ConsultSessionTurn } from '@/types/consult';
import { detectSelfHarm, SELF_HARM_GUIDANCE } from '@/utils/sensitiveGuard';

const MIN_QUESTION_LENGTH = 2;
const MAX_QUESTION_LENGTH = 100;
const QUESTION_TEXTAREA_MIN_HEIGHT = 200;

function normalizeQuestion(raw: string): string {
  return raw.trim().replace(/\s{2,}/g, ' ');
}

function buildPreviousTurn(
  question: string,
  cards: TarotCard[],
  result: ConsultTurnResult
): ConsultPreviousTurn {
  return {
    question,
    summary: result.summary,
    cardSummary: cards.map((c) => c.nameKo).join(', '),
  };
}

export default function ConsultPage() {
  const navigate = useNavigate();

  const [stage, setStage] = useState<ConsultStage>('category');
  const [categoryId, setCategoryId] = useState<CategoryId | null>(null);
  const [question, setQuestion] = useState('');
  const [spread, setSpread] = useState<Spread | null>(null);
  const [pickedCards, setPickedCards] = useState<TarotCard[]>([]);
  const [turnResult, setTurnResult] = useState<ConsultTurnResult | null>(null);
  const [turnLoading, setTurnLoading] = useState(false);
  const [turnError, setTurnError] = useState<string | null>(null);
  const [previousTurn, setPreviousTurn] = useState<ConsultPreviousTurn | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [shareRewardCount, setShareRewardCount] = useState<number>(getShareRewardCount);
  const [currentSession, setCurrentSession] = useState<ConsultSession | null>(null);
  const [showSelfHarmGuide, setShowSelfHarmGuide] = useState(false);

  const mountedRef = useRef(true);
  const activeCtrlRef = useRef<AbortController | null>(null);
  const adAbortedRef = useRef(false);
  const adRetryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentSessionRef = useRef<ConsultSession | null>(null);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      activeCtrlRef.current?.abort();
      if (adRetryTimerRef.current != null) {
        clearTimeout(adRetryTimerRef.current);
        adRetryTimerRef.current = null;
      }
    };
  }, []);

  const category = useMemo(
    () => (categoryId ? findCategory(categoryId) ?? null : null),
    [categoryId]
  );

  const placeholder = useMemo(
    () => (category ? pickRandomPlaceholder(category) : ''),
    [category]
  );

  const normalized = normalizeQuestion(question);
  const canSubmit = normalized.length >= MIN_QUESTION_LENGTH;
  const isAtMaxLength = question.length >= MAX_QUESTION_LENGTH;

  const startConsultFetch = (signal: AbortSignal): Promise<ConsultTurnResult> => {
    if (!category || !spread) {
      return Promise.reject(new ConsultServiceError('상담을 시작할 수 없어요.'));
    }
    return ConsultService.getConsultTurn({
      category,
      question: normalized,
      picks: pickedCards.map((card, i) => ({
        position: spread.positions[i] ?? '',
        card,
      })),
      previousTurn: previousTurn ?? undefined,
      signal,
    });
  };

  const wireFetchToState = (
    promise: Promise<ConsultTurnResult>,
    isAlive: () => boolean
  ) => {
    promise
      .then((result) => {
        if (!isAlive()) return;
        setTurnResult(result);
        setTurnLoading(false);
      })
      .catch((e) => {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        if (!isAlive()) return;
        const msg =
          e instanceof ConsultServiceError
            ? e.message
            : 'AI 해석을 일시적으로 사용할 수 없어요. 잠시 후 다시 시도해 주세요.';
        setTurnError(msg);
        setTurnLoading(false);
      });
  };

  // 새 turnResult가 도착할 때마다 현재 세션에 턴을 추가하고 localStorage에 저장.
  // 세션이 없으면 새로 생성. 세션 종료(handleEndSession)나 카테고리 변경 시 ref가 클리어된다.
  useEffect(() => {
    if (!turnResult) return;
    if (!category || !spread) return;
    if (pickedCards.length !== spread.count) return;

    const now = Date.now();
    const turn: ConsultSessionTurn = {
      question: normalized,
      spreadCount: spread.count,
      cards: pickedCards.map((c, i) => ({
        id: c.id,
        position: spread.positions[i] ?? '',
      })),
      cardMeanings: turnResult.cardMeanings,
      summary: turnResult.summary,
      createdAt: now,
    };

    const prev = currentSessionRef.current;
    const updated: ConsultSession = prev
      ? { ...prev, turns: [...prev.turns, turn] }
      : {
          id: generateSessionId(),
          createdAt: now,
          date: getTodayString(),
          categoryId: category.id,
          categoryLabel: category.label,
          turns: [turn],
        };

    saveConsultSession(updated);
    currentSessionRef.current = updated;
    setCurrentSession(updated);
  }, [turnResult, category, spread, pickedCards, normalized]);

  /** 모든 reset 경로에서 turn 관련 상태 + 광고 게이트 한꺼번에 클리어 */
  const resetTurn = () => {
    activeCtrlRef.current?.abort();
    if (adRetryTimerRef.current != null) {
      clearTimeout(adRetryTimerRef.current);
      adRetryTimerRef.current = null;
    }
    setTurnResult(null);
    setTurnError(null);
    setTurnLoading(false);
    setUnlocked(false);
  };

  const handleSelectCategory = (id: CategoryId) => {
    resetTurn();
    currentSessionRef.current = null;
    setCurrentSession(null);
    setCategoryId(id);
    setQuestion('');
    setSpread(null);
    setPickedCards([]);
    setPreviousTurn(null);
    setStage('input');
  };

  const handleChangeCategory = () => {
    resetTurn();
    currentSessionRef.current = null;
    setCurrentSession(null);
    setStage('category');
    setCategoryId(null);
    setQuestion('');
    setSpread(null);
    setPickedCards([]);
    setPreviousTurn(null);
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    if (detectSelfHarm(normalized)) {
      setShowSelfHarmGuide(true);
      return;
    }
    resetTurn();
    setSpread(decideSpread(normalized));
    setPickedCards([]);
    setStage('pick');
  };

  const handleDismissSelfHarmGuide = () => {
    setShowSelfHarmGuide(false);
    setQuestion('');
  };

  const handleBackToInput = () => {
    resetTurn();
    setSpread(null);
    setPickedCards([]);
    setStage('input');
  };

  const handlePickComplete = (cards: TarotCard[]) => {
    resetTurn();
    setPickedCards(cards);
    setStage('result');
  };

  const handleSelectFollowUp = (followUpQuestion: string) => {
    if (!turnResult) return;
    const prev = buildPreviousTurn(normalized, pickedCards, turnResult);
    resetTurn();
    setPreviousTurn(prev);
    setQuestion(followUpQuestion);
    setSpread(decideSpread(followUpQuestion));
    setPickedCards([]);
    setStage('pick');
  };

  const handleCustomFollowUp = () => {
    if (!turnResult) return;
    const prev = buildPreviousTurn(normalized, pickedCards, turnResult);
    resetTurn();
    setPreviousTurn(prev);
    setQuestion('');
    setSpread(null);
    setPickedCards([]);
    setStage('input');
  };

  const handleEndSession = () => {
    // 진행된 세션이 없으면 곧장 홈
    const session = currentSessionRef.current;
    if (!session) {
      resetTurn();
      navigate('/');
      return;
    }
    // 세션 마무리: closingMessage 채우고 closing 스테이지로
    const closingMessage = `${session.categoryLabel}에 대해 ${session.turns.length}번의 카드와 함께 이야기 나눴어요.`;
    const finalized: ConsultSession = { ...session, closingMessage };
    saveConsultSession(finalized);
    currentSessionRef.current = finalized;
    setCurrentSession(finalized);

    // 진행 중 광고/요청만 정리하고 세션 자체는 closing 화면 노출용으로 유지
    activeCtrlRef.current?.abort();
    if (adRetryTimerRef.current != null) {
      clearTimeout(adRetryTimerRef.current);
      adRetryTimerRef.current = null;
    }
    setUnlocked(false);
    setTurnLoading(false);
    setTurnError(null);
    setTurnResult(null);
    setStage('closing');
  };

  const handleGoHome = () => {
    resetTurn();
    currentSessionRef.current = null;
    setCurrentSession(null);
    navigate('/');
  };

  /** 해석권으로 즉시 잠금 해제. 광고 없음. */
  const handleUnlockWithCredit = () => {
    if (!category || !spread || pickedCards.length !== spread.count) return;
    if (turnLoading || unlocked) return;
    if (!useShareRewardCredit()) return;

    setShareRewardCount(getShareRewardCount());
    setUnlocked(true);
    setTurnError(null);
    setTurnLoading(true);

    const ctrl = new AbortController();
    activeCtrlRef.current?.abort();
    activeCtrlRef.current = ctrl;
    wireFetchToState(startConsultFetch(ctrl.signal), () => mountedRef.current);
  };

  /**
   * 광고 시청 패턴: fetch는 광고와 동시에 시작하여 응답 지연을 광고 시간으로 흡수.
   * - 광고 onRewarded → unlocked=true + fetch 결과 표시 (await 후 set)
   * - 광고 onDismiss   → fetch abort + 잠금 유지
   * - 광고 onFailed    → 최대 2회 재시도, 그래도 실패 시 광고 없이 결과 노출 (사용자 페널티 X)
   */
  const handleUnlockWithAd = () => {
    if (!category || !spread || pickedCards.length !== spread.count) return;
    if (turnLoading || unlocked) return;

    const ctrl = new AbortController();
    activeCtrlRef.current?.abort();
    activeCtrlRef.current = ctrl;
    adAbortedRef.current = false;

    setTurnError(null);
    setTurnLoading(true);

    const fetchPromise = startConsultFetch(ctrl.signal);
    const isAlive = () => mountedRef.current && !adAbortedRef.current;

    const reveal = () => {
      if (!isAlive()) return;
      setUnlocked(true);
      wireFetchToState(fetchPromise, isAlive);
    };

    const RETRY_BACKOFF_MS = 500;
    const tryShowAd = (retriesLeft: number) => {
      if (!isAlive()) return;
      AdService.showRewardedAd({
        onRewarded: () => {
          reveal();
        },
        onDismiss: () => {
          adAbortedRef.current = true;
          ctrl.abort();
          if (adRetryTimerRef.current != null) {
            clearTimeout(adRetryTimerRef.current);
            adRetryTimerRef.current = null;
          }
          if (mountedRef.current) {
            setTurnLoading(false);
          }
        },
        onFailed: () => {
          if (retriesLeft > 0) {
            adRetryTimerRef.current = setTimeout(() => {
              adRetryTimerRef.current = null;
              tryShowAd(retriesLeft - 1);
            }, RETRY_BACKOFF_MS);
          } else {
            reveal();
          }
        },
      });
    };

    tryShowAd(2);
  };

  /** 잠금 해제 후 결과 가져오기 실패 시 재시도 (이미 비용 지불 — 광고/해석권 재사용 X) */
  const handleRetryFetch = () => {
    if (!category || !spread || pickedCards.length !== spread.count) return;
    if (turnLoading) return;
    setTurnError(null);
    setTurnLoading(true);

    const ctrl = new AbortController();
    activeCtrlRef.current?.abort();
    activeCtrlRef.current = ctrl;
    wireFetchToState(startConsultFetch(ctrl.signal), () => mountedRef.current);
  };

  const pageState: PageState = 'success';

  return (
    <PageStateView
      state={pageState}
      config={{
        loading: { message: '준비 중…' },
        empty: { message: '카테고리를 선택해 주세요.' },
        error: {
          message: '오류가 발생했습니다.',
          retryLabel: '다시 시도',
          onRetry: handleChangeCategory,
          backLabel: '돌아가기',
          onBack: () => window.history.back(),
        },
      }}
    >
      <div
        className="page-consult"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: spacingPx('xl'),
          width: '100%',
          minWidth: 0,
        }}
      >
        <header style={{ marginBottom: spacingPx('xs') }}>
          <Paragraph typography="t4" style={{ margin: 0 }}>
            <Paragraph.Text fontWeight="bold">타로 상담</Paragraph.Text>
          </Paragraph>
          <Paragraph typography="t6" style={{ marginTop: spacingPx('xxs'), marginBottom: 0 }}>
            <Paragraph.Text color="gray">
              카테고리를 골라 마음속 질문을 깊게 나눠보세요.
            </Paragraph.Text>
          </Paragraph>
        </header>

        {stage === 'category' && <CategoryPicker onSelect={handleSelectCategory} />}

        {stage === 'input' && category && showSelfHarmGuide && (
          <SelfHarmGuideCard onDismiss={handleDismissSelfHarmGuide} />
        )}

        {stage === 'input' && category && !showSelfHarmGuide && (
          <div
            className="consult-input-field"
            style={{ display: 'flex', flexDirection: 'column', gap: spacingPx('md'), width: '100%' }}
          >
            <CategorySummaryCard
              emoji={category.emoji}
              label={category.label}
              hint={category.hint}
            />

            {previousTurn && (
              <PreviousTurnCard previousTurn={previousTurn} />
            )}

            <div
              className="glass-card section-card"
              style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: spacingPx('xs') }}
              role="region"
              aria-label="질문 입력"
            >
              <Paragraph typography="t7" style={{ margin: 0 }}>
                <Paragraph.Text color="gray" fontWeight="bold">질문</Paragraph.Text>
              </Paragraph>
              <TextArea
                variant="box"
                minHeight={QUESTION_TEXTAREA_MIN_HEIGHT}
                placeholder={`예) ${placeholder}`}
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
                  <Paragraph.Text color="gray">
                    질문은 {MIN_QUESTION_LENGTH}자 이상 입력해 주세요.
                  </Paragraph.Text>
                </Paragraph>
              )}
              {canSubmit && (
                <SpreadPreviewBadge spread={decideSpread(normalized)} />
              )}
            </div>

            <SpreadHintCard />

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
            <Button
              color="dark"
              variant="weak"
              display="block"
              onClick={handleChangeCategory}
              style={{ width: '100%' }}
            >
              카테고리 다시 고르기
            </Button>
          </div>
        )}

        {stage === 'pick' && category && spread && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacingPx('md'), width: '100%' }}>
            <QuestionSummaryCard category={category.label} question={normalized} />
            <MultiCardDeckPicker
              count={spread.count}
              positions={spread.positions}
              onComplete={handlePickComplete}
            />
            <Button
              color="dark"
              variant="weak"
              display="block"
              onClick={handleBackToInput}
              style={{ width: '100%' }}
            >
              질문 다시 쓰기
            </Button>
          </div>
        )}

        {stage === 'result' && category && spread && pickedCards.length === spread.count && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacingPx('lg'), width: '100%' }}>
            <QuestionSummaryCard category={category.label} question={normalized} />

            <div
              role="region"
              aria-label="뽑힌 카드"
              style={{ display: 'flex', flexDirection: 'column', gap: spacingPx('sm'), width: '100%' }}
            >
              {pickedCards.map((card, i) => (
                <PickedCardRow
                  key={card.id}
                  position={spread.positions[i] ?? ''}
                  card={card}
                  meaning={turnResult?.cardMeanings[i]?.meaning}
                />
              ))}
            </div>

            {!unlocked && !turnLoading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacingPx('xs'), width: '100%' }}>
                {shareRewardCount > 0 && (
                  <Button
                    color="primary"
                    variant="fill"
                    display="block"
                    onClick={handleUnlockWithCredit}
                    style={{ width: '100%' }}
                  >
                    해석권으로 결과 보기 ({shareRewardCount}개 보유)
                  </Button>
                )}
                <Button
                  color="primary"
                  variant={shareRewardCount > 0 ? 'weak' : 'fill'}
                  display="block"
                  onClick={handleUnlockWithAd}
                  style={{ width: '100%' }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacingPx('xs') }} aria-hidden>
                    <span style={{ fontSize: '1.1em' }}>🔒</span>
                    광고 보고 결과 보기
                  </span>
                </Button>
                <Button color="dark" variant="weak" display="block" onClick={handleBackToInput} style={{ width: '100%' }}>
                  질문 다시 쓰기
                </Button>
                <Button color="dark" variant="weak" display="block" onClick={handleEndSession} style={{ width: '100%' }}>
                  오늘은 이만 듣기
                </Button>
              </div>
            )}

            {unlocked && turnLoading && (
              <div
                className="glass-card section-card"
                style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: spacingPx('md'),
                  padding: spacingPx('xl'),
                }}
                role="status"
                aria-live="polite"
              >
                <LoadingSpinner />
                <Paragraph typography="t7" style={{ margin: 0 }}>
                  <Paragraph.Text color="gray">카드의 의미를 읽고 있어요…</Paragraph.Text>
                </Paragraph>
              </div>
            )}

            {unlocked && turnError && !turnLoading && (
              <div className="glass-card section-card" style={{ width: '100%' }} role="alert">
                <Paragraph typography="t6" style={{ margin: 0 }}>
                  <Paragraph.Text fontWeight="bold">⚠️ 해석을 가져오지 못했어요</Paragraph.Text>
                </Paragraph>
                <Paragraph typography="t7" style={{ marginTop: spacingPx('xs'), marginBottom: 0, lineHeight: 1.5 }}>
                  <Paragraph.Text color="gray">{turnError}</Paragraph.Text>
                </Paragraph>
                <div style={{ marginTop: spacingPx('md'), display: 'flex', flexDirection: 'column', gap: spacingPx('xs') }}>
                  <Button color="primary" variant="fill" display="block" onClick={handleRetryFetch} style={{ width: '100%' }}>
                    다시 시도
                  </Button>
                  <Button color="dark" variant="weak" display="block" onClick={handleBackToInput} style={{ width: '100%' }}>
                    질문 다시 쓰기
                  </Button>
                </div>
              </div>
            )}

            {unlocked && turnResult && !turnLoading && !turnError && currentSession && currentSession.turns.length >= 5 && (
              <div
                className="glass-card section-card"
                style={{ width: '100%', textAlign: 'center' }}
                role="note"
              >
                <Paragraph typography="t7" style={{ margin: 0 }}>
                  <Paragraph.Text color="gray">
                    충분히 들으셨다면 아래 “오늘은 이만 듣기”로 마무리해 보세요.
                  </Paragraph.Text>
                </Paragraph>
              </div>
            )}

            {unlocked && turnResult && !turnLoading && !turnError && (
              <>
                <div className="glass-card section-card" style={{ width: '100%' }} role="region" aria-label="종합 해석">
                  <Paragraph typography="t7" style={{ margin: 0 }}>
                    <Paragraph.Text fontWeight="bold">종합 해석</Paragraph.Text>
                  </Paragraph>
                  <Paragraph
                    typography="t6"
                    style={{ marginTop: spacingPx('xs'), marginBottom: 0, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}
                  >
                    <Paragraph.Text>{turnResult.summary}</Paragraph.Text>
                  </Paragraph>
                  <Paragraph typography="t7" style={{ marginTop: spacingPx('md'), marginBottom: 0 }}>
                    <Paragraph.Text color="gray">
                      면책 조항은 설정에서 확인할 수 있습니다.
                    </Paragraph.Text>
                  </Paragraph>
                </div>

                {turnResult.nextQuestions.length > 0 && (
                  <div
                    role="region"
                    aria-label="다음 질문"
                    style={{ display: 'flex', flexDirection: 'column', gap: spacingPx('xs'), width: '100%' }}
                  >
                    <Paragraph typography="t7" style={{ margin: 0 }}>
                      <Paragraph.Text color="gray" fontWeight="bold">
                        이어서 묻고 싶은 것
                      </Paragraph.Text>
                    </Paragraph>
                    {turnResult.nextQuestions.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => handleSelectFollowUp(q)}
                        className="glass-card consult-followup-item"
                        style={{
                          width: '100%',
                          padding: spacingPx('md'),
                          borderRadius: radiusPx('lg'),
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          gap: spacingPx('xs'),
                        }}
                        aria-label={`다음 질문: ${q}`}
                      >
                        <span aria-hidden style={{ opacity: 0.6 }}>›</span>
                        <span style={{ flex: 1 }}>
                          <Paragraph typography="t6" style={{ margin: 0, lineHeight: 1.5 }}>
                            <Paragraph.Text>{q}</Paragraph.Text>
                          </Paragraph>
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: spacingPx('xs'), width: '100%' }}>
                  <Button
                    color="primary"
                    variant="weak"
                    display="block"
                    onClick={handleCustomFollowUp}
                    style={{ width: '100%' }}
                  >
                    직접 입력해서 묻기
                  </Button>
                  <Button color="dark" variant="weak" display="block" onClick={handleEndSession} style={{ width: '100%' }}>
                    오늘은 이만 듣기
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {stage === 'closing' && currentSession && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacingPx('lg'), width: '100%' }}>
            <SessionClosingCard session={currentSession} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: spacingPx('xs'), width: '100%' }}>
              <Button color="primary" variant="weak" display="block" onClick={handleChangeCategory} style={{ width: '100%' }}>
                다른 카테고리 보기
              </Button>
              <Button color="dark" variant="weak" display="block" onClick={handleGoHome} style={{ width: '100%' }}>
                메인으로
              </Button>
            </div>
          </div>
        )}

        <Paragraph typography="t7" style={{ textAlign: 'center', margin: 0 }}>
          <Paragraph.Text color="gray">
            카드의 답변은 오락 목적이며, 실질적 조언이 아닙니다.
          </Paragraph.Text>
        </Paragraph>
      </div>
    </PageStateView>
  );
}

function SelfHarmGuideCard({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div
      role="region"
      aria-label="민감 안내"
      className="glass-card section-card"
      style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: spacingPx('sm') }}
    >
      <Paragraph typography="t5" style={{ margin: 0 }}>
        <Paragraph.Text fontWeight="bold">{SELF_HARM_GUIDANCE.title}</Paragraph.Text>
      </Paragraph>
      <Paragraph typography="t6" style={{ margin: 0, lineHeight: 1.7 }}>
        <Paragraph.Text>{SELF_HARM_GUIDANCE.message}</Paragraph.Text>
      </Paragraph>
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacingPx('xxs'), marginTop: spacingPx('xs') }}>
        {SELF_HARM_GUIDANCE.hotlines.map((h) => (
          <a
            key={h.number}
            href={`tel:${h.number}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: spacingPx('sm'),
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.06)',
              textDecoration: 'none',
            }}
            aria-label={`${h.label} ${h.number}로 전화 걸기`}
          >
            <Paragraph typography="t6" style={{ margin: 0 }}>
              <Paragraph.Text fontWeight="bold">{h.label}</Paragraph.Text>
            </Paragraph>
            <Paragraph typography="t5" style={{ margin: 0 }}>
              <Paragraph.Text fontWeight="bold">{h.number}</Paragraph.Text>
            </Paragraph>
          </a>
        ))}
      </div>
      <Paragraph typography="t7" style={{ margin: 0 }}>
        <Paragraph.Text color="gray">
          타로의 답은 오락 목적이며 위기 상황의 답이 될 수 없어요. 도움을 청하는 건 용기예요.
        </Paragraph.Text>
      </Paragraph>
      <Button color="dark" variant="weak" display="block" onClick={onDismiss} style={{ width: '100%' }}>
        다른 질문으로 바꾸기
      </Button>
    </div>
  );
}

function SessionClosingCard({ session }: { session: ConsultSession }) {
  const totalCards = session.turns.reduce((sum, t) => sum + t.cards.length, 0);
  return (
    <div className="glass-card section-card" style={{ width: '100%' }} role="region" aria-label="세션 마무리">
      <Paragraph typography="t7" style={{ margin: 0 }}>
        <Paragraph.Text color="gray" fontWeight="bold">마무리</Paragraph.Text>
      </Paragraph>
      <Paragraph typography="t5" style={{ marginTop: spacingPx('xs'), marginBottom: 0 }}>
        <Paragraph.Text fontWeight="bold">{session.categoryLabel}</Paragraph.Text>
      </Paragraph>
      <Paragraph typography="t6" style={{ marginTop: spacingPx('sm'), marginBottom: 0, lineHeight: 1.6 }}>
        <Paragraph.Text>{session.closingMessage}</Paragraph.Text>
      </Paragraph>
      <Paragraph typography="t7" style={{ marginTop: spacingPx('md'), marginBottom: 0 }}>
        <Paragraph.Text color="gray">
          {session.turns.length}번의 질문 · 카드 {totalCards}장 · 기록에서 다시 볼 수 있어요.
        </Paragraph.Text>
      </Paragraph>
    </div>
  );
}

function CategorySummaryCard({ emoji, label, hint }: { emoji: string; label: string; hint: string }) {
  return (
    <div className="glass-card section-card" style={{ width: '100%' }} role="region" aria-label="선택한 카테고리">
      <Paragraph typography="t7" style={{ margin: 0 }}>
        <Paragraph.Text color="gray" fontWeight="bold">카테고리</Paragraph.Text>
      </Paragraph>
      <div style={{ marginTop: spacingPx('xxs'), display: 'flex', alignItems: 'center', gap: spacingPx('xs') }}>
        <span aria-hidden style={{ fontSize: spacingPx('lg'), lineHeight: 1 }}>{emoji}</span>
        <Paragraph typography="t6" style={{ margin: 0 }}>
          <Paragraph.Text fontWeight="bold">{label}</Paragraph.Text>
        </Paragraph>
      </div>
      <Paragraph typography="t7" style={{ marginTop: spacingPx('xs'), marginBottom: 0 }}>
        <Paragraph.Text color="gray">{hint}</Paragraph.Text>
      </Paragraph>
    </div>
  );
}

function QuestionSummaryCard({ category, question }: { category: string; question: string }) {
  return (
    <div className="glass-card section-card" style={{ width: '100%' }} role="region" aria-label="질문">
      <Paragraph typography="t7" style={{ margin: 0 }}>
        <Paragraph.Text color="gray" fontWeight="bold">{category}</Paragraph.Text>
      </Paragraph>
      <Paragraph typography="t6" style={{ marginTop: spacingPx('xxs'), marginBottom: 0, lineHeight: 1.6 }}>
        <Paragraph.Text>{'"'}{question}{'"'}</Paragraph.Text>
      </Paragraph>
    </div>
  );
}

function PreviousTurnCard({ previousTurn }: { previousTurn: ConsultPreviousTurn }) {
  return (
    <div className="glass-card section-card" style={{ width: '100%' }} role="region" aria-label="직전 흐름">
      <Paragraph typography="t7" style={{ margin: 0 }}>
        <Paragraph.Text color="gray" fontWeight="bold">직전 흐름</Paragraph.Text>
      </Paragraph>
      <Paragraph typography="t7" style={{ marginTop: spacingPx('xs'), marginBottom: 0, lineHeight: 1.6 }}>
        <Paragraph.Text>"{previousTurn.question}"</Paragraph.Text>
      </Paragraph>
      <Paragraph typography="t7" style={{ marginTop: spacingPx('xxs'), marginBottom: 0 }}>
        <Paragraph.Text color="gray">카드: {previousTurn.cardSummary}</Paragraph.Text>
      </Paragraph>
    </div>
  );
}

function PickedCardRow({
  position,
  card,
  meaning,
}: {
  position: string;
  card: TarotCard;
  meaning?: string;
}) {
  return (
    <div
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
        <CardThumb card={card} size={56} emojiFontSize={spacingPx('xxl')} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Paragraph typography="t7" style={{ margin: 0 }}>
            <Paragraph.Text color="gray" fontWeight="bold">{position}</Paragraph.Text>
          </Paragraph>
          <Paragraph typography="t6" style={{ marginTop: spacingPx('xxs'), marginBottom: 0 }}>
            <Paragraph.Text fontWeight="bold">{card.nameKo}</Paragraph.Text>
          </Paragraph>
          <Paragraph typography="t7" style={{ marginTop: spacingPx('xxs'), marginBottom: 0 }}>
            <Paragraph.Text color="gray">{card.name}</Paragraph.Text>
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
}
