/**
 * P0-02: 로딩/빈 상태/에러 공통 뷰. 재사용 로딩 UI + 예외 시 행동 버튼.
 */
import type { ReactNode } from 'react';
import { Button, Paragraph } from '@toss/tds-mobile';
import { spacingPx } from '@/design/tokens';
import LoadingSpinner from './LoadingSpinner';
import type { PageState } from '@/types/pageState';

export interface PageStateConfig {
  loading?: { message?: string };
  empty: { icon?: string; message: string; subMessage?: string; actionLabel?: string; onAction?: () => void };
  error: { message: string; subMessage?: string; retryLabel?: string; onRetry?: () => void; backLabel?: string; onBack?: () => void };
}

interface PageStateViewProps {
  state: PageState;
  config: PageStateConfig;
  children: ReactNode;
}

export default function PageStateView({ state, config, children }: PageStateViewProps) {
  if (state === 'success') {
    return <>{children}</>;
  }

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    gap: spacingPx('md'),
    padding: spacingPx('xxl'),
    minHeight: '120px',
  };

  if (state === 'loading') {
    return (
      <div className="page-state-container" style={containerStyle}>
        <LoadingSpinner />
        {config.loading?.message && (
          <Paragraph typography="t7" style={{ margin: 0 }}>
            <Paragraph.Text color="gray">{config.loading.message}</Paragraph.Text>
          </Paragraph>
        )}
      </div>
    );
  }

  if (state === 'empty') {
    const { icon = '📭', message, subMessage, actionLabel, onAction } = config.empty;
    return (
      <div className="page-state-container" style={containerStyle}>
        <span style={{ fontSize: spacingPx('xxxl'), opacity: 0.3 }} aria-hidden>{icon}</span>
        <Paragraph typography="t6" style={{ margin: 0 }}>
          <Paragraph.Text color="gray">{message}</Paragraph.Text>
        </Paragraph>
        {subMessage && (
          <Paragraph typography="t7" style={{ margin: 0 }}>
            <Paragraph.Text color="gray">{subMessage}</Paragraph.Text>
          </Paragraph>
        )}
        {actionLabel && onAction && (
          <Button color="primary" variant="fill" display="inline" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </div>
    );
  }

  if (state === 'error') {
    const { message, subMessage, retryLabel, onRetry, backLabel, onBack } = config.error;
    return (
      <div className="page-state-container" style={containerStyle}>
        <span style={{ fontSize: spacingPx('xxxxl') }} aria-hidden>⚠️</span>
        <Paragraph typography="t6" style={{ margin: 0 }}>
          <Paragraph.Text fontWeight="bold">{message}</Paragraph.Text>
        </Paragraph>
        {subMessage && (
          <Paragraph typography="t7" style={{ margin: 0 }}>
            <Paragraph.Text color="gray">{subMessage}</Paragraph.Text>
          </Paragraph>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacingPx('xs'), marginTop: spacingPx('xs') }}>
          {retryLabel && onRetry && (
            <Button color="primary" variant="fill" display="block" onClick={onRetry}>
              {retryLabel}
            </Button>
          )}
          {backLabel && onBack && (
            <Button color="dark" variant="weak" display="inline" onClick={onBack}>
              {backLabel}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return null;
}
