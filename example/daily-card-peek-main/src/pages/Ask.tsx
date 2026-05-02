import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getQuestionCard } from "@/utils/dailyCard";
import { TarotCard } from "@/types/tarot";
import { Send, RotateCcw } from "lucide-react";
import { getOrCreateUserSeed } from "@/utils/storage";

/** 질문하기 페이지 */
export default function AskPage() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<TarotCard | null>(null);

  const handleSubmit = () => {
    if (!question.trim()) return;
    const userSeed = getOrCreateUserSeed();
    const card = getQuestionCard(question.trim(), userSeed);
    setResult(card);
  };

  const handleReset = () => {
    setQuestion("");
    setResult(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-gold text-2xl font-bold">질문하기</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          마음속 질문을 적어 보세요. 카드가 답할지도 모릅니다.
        </p>
      </motion.div>

      {!result ? (
        <motion.div
          className="flex flex-col gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="오늘 고민되는 것이 있나요?"
            className="glass-card min-h-[120px] resize-none rounded-2xl p-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
            maxLength={100}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {question.length}/100
            </span>
            <button
              onClick={handleSubmit}
              disabled={!question.trim()}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform active:scale-95 disabled:opacity-40"
            >
              <Send size={16} />
              카드 뽑기
            </button>
          </div>
        </motion.div>
      ) : (
        <AnimatePresence>
          <motion.div
            className="flex flex-col items-center gap-5"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {/* 질문 표시 */}
            <div className="glass-card w-full rounded-2xl p-4">
              <p className="text-xs text-muted-foreground">당신의 질문</p>
              <p className="mt-1 text-sm text-foreground">"{question}"</p>
            </div>

            {/* 카드 결과 */}
            <div className="glass-card flex w-full flex-col items-center gap-4 rounded-2xl p-6">
              <span className="text-5xl">{result.emoji}</span>
              <h2 className="text-gold text-xl font-bold">{result.nameKo}</h2>
              <p className="text-sm text-muted-foreground">{result.name}</p>
              <div className="flex flex-wrap justify-center gap-1.5">
                {result.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* 해석 */}
            <div className="glass-card w-full rounded-2xl p-5">
              <p className="text-sm leading-relaxed text-foreground/90">
                {result.shortReading}
              </p>
              <p className="mt-3 text-sm text-foreground/80">
                💡 {result.advice}
              </p>
            </div>

            {/* 다시 질문 */}
            <button
              onClick={handleReset}
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <RotateCcw size={14} />
              다른 질문하기
            </button>
          </motion.div>
        </AnimatePresence>
      )}

      <p className="text-center text-[10px] text-muted-foreground/50">
        카드의 답변은 오락 목적이며, 실질적 조언이 아닙니다.
      </p>
    </div>
  );
}
