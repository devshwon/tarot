import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useDailyCard } from "@/hooks/useDailyCard";
import { ArrowLeft, Sparkles } from "lucide-react";

/** 상세 해석 페이지 (잠금 해제 후) */
export default function DetailPage() {
  const { card, unlocked, unlock } = useDailyCard();
  const navigate = useNavigate();

  if (!card) return null;

  // 잠금 미해제 시
  if (!unlocked) {
    return (
      <div className="flex flex-col items-center gap-6 pt-10 text-center">
        <span className="text-5xl">🔒</span>
        <h2 className="text-lg font-bold text-foreground">상세 해석이 잠겨 있습니다</h2>
        <p className="text-sm text-muted-foreground">
          광고를 시청하면 오늘의 상세 해석을 확인할 수 있습니다.
        </p>
        <button
          onClick={() => {
            unlock();
          }}
          className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform active:scale-95"
        >
          광고 보고 잠금 해제
        </button>
        <button
          onClick={() => navigate("/")}
          className="text-sm text-muted-foreground underline"
        >
          돌아가기
        </button>
      </div>
    );
  }

  return (
    <motion.div
      className="flex flex-col gap-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* 헤더 */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-1 text-sm text-muted-foreground"
      >
        <ArrowLeft size={16} />
        돌아가기
      </button>

      {/* 카드 정보 */}
      <div className="glass-card flex items-center gap-4 rounded-2xl p-5">
        <span className="text-5xl">{card.emoji}</span>
        <div>
          <h1 className="text-gold text-xl font-bold">{card.nameKo}</h1>
          <p className="text-sm text-muted-foreground">{card.name}</p>
        </div>
      </div>

      {/* 상세 해석 */}
      <motion.div
        className="glass-card rounded-2xl p-5"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="mb-3 flex items-center gap-2">
          <Sparkles size={16} className="text-gold" />
          <h2 className="text-sm font-semibold text-foreground">상세 해석</h2>
        </div>
        <p className="text-sm leading-relaxed text-foreground/90">
          {card.detailedReading}
        </p>
      </motion.div>

      {/* 오늘의 조언 */}
      <motion.div
        className="glass-card rounded-2xl p-5"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="mb-2 text-sm font-semibold text-foreground">💡 오늘의 조언</h3>
        <p className="text-sm text-foreground/90">{card.advice}</p>
      </motion.div>

      {/* 럭키 아이템 */}
      <motion.div
        className="flex gap-3"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="glass-card flex-1 rounded-2xl p-4 text-center">
          <p className="text-xs text-muted-foreground">행운의 색</p>
          <p className="text-gold mt-1 text-sm font-semibold">{card.luckyColor}</p>
        </div>
        <div className="glass-card flex-1 rounded-2xl p-4 text-center">
          <p className="text-xs text-muted-foreground">행운의 숫자</p>
          <p className="text-gold mt-1 text-sm font-semibold">{card.luckyNumber}</p>
        </div>
      </motion.div>

      {/* 면책 */}
      <p className="text-center text-[10px] text-muted-foreground/50">
        이 해석은 오락 목적이며 어떠한 실질적 결정의 근거가 될 수 없습니다.
      </p>
    </motion.div>
  );
}
