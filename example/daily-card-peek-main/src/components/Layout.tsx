import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Clock, MessageCircle, Settings } from "lucide-react";

/** 하단 탭 네비게이션 바 */
function BottomNav() {
  const { pathname } = useLocation();

  const tabs = [
    { path: "/", icon: Home, label: "오늘의 카드" },
    { path: "/ask", icon: MessageCircle, label: "질문하기" },
    { path: "/history", icon: Clock, label: "기록" },
    { path: "/settings", icon: Settings, label: "설정" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card safe-bottom">
      <div className="mx-auto flex max-w-md items-center justify-around py-2">
        {tabs.map((tab) => {
          const active = pathname === tab.path;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs transition-colors ${
                active ? "text-gold" : "text-muted-foreground"
              }`}
            >
              <tab.icon size={20} strokeWidth={active ? 2.2 : 1.5} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/** 전체 레이아웃 래퍼 */
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="gradient-mystical flex min-h-screen flex-col">
      <main className="mx-auto w-full max-w-md flex-1 px-4 pb-24 pt-6">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
