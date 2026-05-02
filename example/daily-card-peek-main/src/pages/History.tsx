import { motion } from "framer-motion";
import { getHistory } from "@/utils/storage";
import { tarotCards } from "@/utils/tarotData";
import { Clock } from "lucide-react";

/** 히스토리 페이지: 최근 14일 기록 */
export default function HistoryPage() {
  const history = getHistory();

  return (
    <div className="flex flex-col gap-5">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-gold text-2xl font-bold">기록</h1>
        <p className="mt-1 text-sm text-muted-foreground">최근 14일간의 카드 기록</p>
      </motion.div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center gap-3 pt-16 text-center">
          <Clock size={40} className="text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">아직 기록이 없습니다</p>
          <p className="text-xs text-muted-foreground/60">오늘의 카드를 뽑아 보세요!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {history.map((entry, i) => {
            const card = tarotCards.find((c) => c.id === entry.cardId);
            if (!card) return null;
            return (
              <motion.div
                key={entry.date}
                className="glass-card flex items-center gap-4 rounded-2xl p-4"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <span className="text-3xl">{card.emoji}</span>
                <div className="flex-1">
                  <p className="text-gold text-sm font-semibold">{card.nameKo}</p>
                  <p className="text-xs text-muted-foreground">{entry.date}</p>
                </div>
                {entry.unlocked && (
                  <span className="text-[10px] text-muted-foreground/60">상세 확인됨</span>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
