import { useState, useCallback } from 'react';
import { Button, Paragraph, useDialog, useToast } from '@toss/tds-mobile';
import PageStateView from '@/components/PageStateView';
import { clearAppData, getShareRewardCount, addShareRewardCredits } from '@/utils/storage';
import { spacingPx } from '@/design/tokens';
import type { PageState } from '@/types/pageState';
import { contactsViral } from '@apps-in-toss/web-framework';

const SHARE_REWARD_MODULE_ID = 'afe0bfc6-c6ae-471b-a840-2e8544b2cbaa';

export default function SettingsPage() {
  const { openConfirm } = useDialog();
  const toast = useToast();
  const [pageState, setPageState] = useState<PageState>('success');
  const [rewardCount, setRewardCount] = useState(getShareRewardCount);

  const handleInvite = useCallback(() => {
    try {
      const cleanup = contactsViral({
        options: { moduleId: SHARE_REWARD_MODULE_ID.trim() },
        onEvent: (event) => {
          if (event.type === 'sendViral' && event.data?.rewardAmount != null && event.data.rewardAmount > 0) {
            addShareRewardCredits(event.data.rewardAmount);
            setRewardCount(getShareRewardCount());
            toast.openToast(`해석권 ${event.data.rewardAmount}개가 지급되었어요`);
          }
          if (event.type === 'close') {
            setRewardCount(getShareRewardCount());
            cleanup();
          }
        },
        onError: () => {
          toast.openToast('공유를 시작하지 못했어요. 다시 시도해 주세요.');
        },
      });
    } catch {
      toast.openToast('이 환경에서는 친구 초대를 사용할 수 없어요.');
    }
  }, [toast]);

  const handleReset = async () => {
    const result = await openConfirm({
      title: '데이터 초기화',
      description: '기록과 잠금 정보가 삭제됩니다. 진행할까요?',
      confirmButton: '초기화',
      cancelButton: '취소',
    });
    if (!result) return;
    try {
      clearAppData();
      toast.openToast('데이터가 초기화되었습니다');
      window.location.hash = '#/';
      window.location.reload();
    } catch {
      setPageState('error');
    }
  };

  return (
    <PageStateView
      state={pageState}
      config={{
        empty: { message: '설정할 내용이 없습니다.' },
        error: {
          message: '데이터 초기화에 실패했습니다.',
          subMessage: '잠시 후 다시 시도해 주세요.',
          retryLabel: '다시 시도',
          onRetry: () => setPageState('success'),
          backLabel: '설정으로',
          onBack: () => setPageState('success'),
        },
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacingPx('xl'), width: '100%' }}>
        <header style={{ marginBottom: spacingPx('xs') }}>
          <Paragraph typography="t4" style={{ margin: 0 }}>
            <Paragraph.Text fontWeight="bold">설정</Paragraph.Text>
          </Paragraph>
          <Paragraph typography="t6" style={{ marginTop: spacingPx('xxs'), marginBottom: 0 }}>
            <Paragraph.Text color="gray">앱 정보와 데이터를 관리합니다.</Paragraph.Text>
          </Paragraph>
        </header>

        <div className="glass-card section-card">
          <Paragraph typography="t5" style={{ margin: `0 0 ${spacingPx('sm')}` }}>
            <Paragraph.Text fontWeight="bold">앱 정보</Paragraph.Text>
          </Paragraph>
          <Paragraph typography="t6" style={{ margin: 0 }}>
            <Paragraph.Text color="gray">타로</Paragraph.Text>
          </Paragraph>
          <Paragraph typography="t7" style={{ margin: `${spacingPx('xxs')} 0 0` }}>
            <Paragraph.Text color="gray">버전 1.0.3</Paragraph.Text>
          </Paragraph>
        </div>

        <div className="glass-card section-card">
          <Paragraph typography="t5" style={{ margin: `0 0 ${spacingPx('sm')}` }}>
            <Paragraph.Text fontWeight="bold">친구 초대</Paragraph.Text>
          </Paragraph>
          <Paragraph typography="t7" style={{ margin: 0 }}>
            <Paragraph.Text color="gray">
              친구에게 공유하면 해석권을 받을 수 있어요. 해석권 1개로 광고 없이 상세 해석을 바로 볼 수 있어요.
            </Paragraph.Text>
          </Paragraph>
          <Paragraph typography="t6" style={{ margin: `${spacingPx('xs')} 0 ${spacingPx('md')}` }}>
            <Paragraph.Text fontWeight="bold">보유 해석권 {rewardCount}개</Paragraph.Text>
          </Paragraph>
          <Button
            color="primary"
            variant="fill"
            display="block"
            onClick={handleInvite}
            style={{ width: '100%' }}
            aria-label="친구에게 공유하고 해석권 받기"
          >
            친구에게 공유하고 해석권 받기
          </Button>
        </div>

        <div className="glass-card section-card">
          <Paragraph typography="t5" style={{ margin: `0 0 ${spacingPx('sm')}` }}>
            <Paragraph.Text fontWeight="bold">면책 조항</Paragraph.Text>
          </Paragraph>
          <Paragraph typography="t7" style={{ margin: 0, lineHeight: 1.6 }}>
            <Paragraph.Text color="gray">
              본 서비스는 오락 목적으로만 제공되며, 타로 해석은 심리·영적·의학·재정 조언이 아니며 결정의 근거로 사용할 수 없습니다. 투자·도박·건강 진단 관련 정보를 제공하지 않습니다. 중요한 결정은 전문가와 상의하세요.
            </Paragraph.Text>
          </Paragraph>
        </div>

        <div className="glass-card section-card">
          <Paragraph typography="t5" style={{ margin: `0 0 ${spacingPx('xs')}` }}>
            <Paragraph.Text fontWeight="bold">데이터 관리</Paragraph.Text>
          </Paragraph>
          <Paragraph typography="t7" style={{ margin: 0 }}>
            <Paragraph.Text color="gray">데이터는 기기 내에만 저장되며 서버로 전송되지 않습니다.</Paragraph.Text>
          </Paragraph>
          <Button
            color="danger"
            variant="weak"
            display="block"
            onClick={handleReset}
            style={{ marginTop: spacingPx('md'), width: '100%' }}
          >
            데이터 초기화
          </Button>
        </div>
      </div>
    </PageStateView>
  );
}
