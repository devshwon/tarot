import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Paragraph } from '@toss/tds-mobile';
import { useSafeAreaVars } from '../hooks/useSafeAreaVars';

const tabs = [
  { path: '/', label: '오늘의 카드' },
  { path: '/ask', label: '질문하기' },
  { path: '/history', label: '기록' },
  { path: '/settings', label: '설정' },
] as const;

const TAB_ARIA_LABELS: Record<string, string> = {
  '/': '오늘의 카드',
  '/ask': '질문하기',
  '/history': '기록',
  '/settings': '설정',
};

function NavIcon({ path }: { path: string }) {
  const icons: Record<string, string> = {
    '/': '🏠',
    '/ask': '💬',
    '/history': '🕐',
    '/settings': '⚙️',
  };
  return <span aria-hidden>{icons[path] ?? '•'}</span>;
}

export default function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  useSafeAreaVars();

  return (
    <div className="gradient-mystical">
      <main className="layout-main">{children}</main>
      <nav className="bottom-nav" aria-label="하단 메뉴">
        <div className="bottom-nav-inner">
          {tabs.map(({ path, label }) => {
            const isActive = pathname === path;
            const ariaLabel = isActive ? `${TAB_ARIA_LABELS[path]} (현재 페이지)` : TAB_ARIA_LABELS[path];
            return (
              <Link
                key={path}
                to={path}
                className={`nav-link ${isActive ? 'active' : ''}`}
                aria-label={ariaLabel}
                aria-current={isActive ? 'page' : undefined}
              >
                <NavIcon path={path} />
                <Paragraph typography="t7" style={{ margin: 0 }} className="nav-link-label">
                  <Paragraph.Text color={isActive ? 'primary' : 'gray'}>
                    {label}
                  </Paragraph.Text>
                </Paragraph>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
