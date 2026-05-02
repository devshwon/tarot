import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDailyCard } from "@/hooks/useDailyCard";
import CardReveal from "@/components/CardReveal";
import { Share2, Lock, Unlock } from "lucide-react";

/** 홈 화면: 오늘의 카드 */
export default function HomePage() {
  const { card, revealed, revealCard, unlocked, unlock, today } = useDailyCard();
  const navigate = useNavigate();
  const [showShare, setShowShare] = useState(false);

  if (!card) return null;

  /** 텍스트 기반 공유 */
  const handleShare = async () => {
    const text = `🔮 오늘의 타로: ${card.nameKo} ${card.emoji}\n"${card.shortReading}"\n\n#오늘의한장 #타로`;
    if (navigator.share) {
      await navigator.share({ text });
    } else {
      await navigator.clipboard.writeText(text);
      setShowShare(true);
      setTimeout(() => setShowShare(false), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* 헤더 */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-sm text-muted-foreground">{today}</p>
        <h1 className="text-gold mt-1 text-2xl font-bold">오늘의 한 장</h1>
      </motion.div>

      {/* 카드 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <CardReveal card={card} revealed={revealed} onReveal={revealCard} />
      </motion.div>

      {/* 간단 해석 */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            className="glass-card w-full rounded-2xl p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-sm leading-relaxed text-foreground">
              {card.shortReading}
            </p>

            <div className="mt-4 flex items-center gap-3">
              {/* 상세 해석 버튼 */}
              <button
                onClick={() => {
                  if (!unlocked) {
                    // 리워드 광고 시뮬레이션 → 즉시 해제
                    unlock();
                  }
                  navigate("/detail");
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-transform active:scale-95"
              >
                {unlocked ? <Unlock size={16} /> : <Lock size={16} />}
                {unlocked ? "상세 해석 보기" : "광고 보고 상세 해석"}
              </button>

              {/* 공유 */}
              <button
                onClick={handleShare}
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-secondary-foreground transition-transform active:scale-95"
                aria-label="공유"
              >
                <Share2 size={18} />
              </button>
            </div>

            {/* 복사 완료 토스트 */}
            <AnimatePresence>
              {showShare && (
                <motion.p
                  className="mt-2 text-center text-xs text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  클립보드에 복사되었습니다 ✓
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 면책 조항 */}
      <p className="mt-4 text-center text-[10px] leading-tight text-muted-foreground/60">
        본 서비스는 오락 목적으로만 제공됩니다. 타로 해석은 재미를 위한 것이며,
        어떠한 결정의 근거로 사용되어서는 안 됩니다.
      </p>
    </div>
  );
}
