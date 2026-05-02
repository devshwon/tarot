import { motion } from "framer-motion";
import { TarotCard } from "@/types/tarot";
import cardBackImage from "@/assets/card-back.png";

interface CardRevealProps {
  card: TarotCard;
  revealed: boolean;
  onReveal: () => void;
}

/** 카드 뒤집기 애니메이션 컴포넌트 */
export default function CardReveal({ card, revealed, onReveal }: CardRevealProps) {
  return (
    <div className="perspective-[1000px] mx-auto w-56">
      <motion.div
        className="relative h-80 w-full cursor-pointer"
        onClick={!revealed ? onReveal : undefined}
        animate={{ rotateY: revealed ? 180 : 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* 카드 뒷면 */}
        <div
          className="absolute inset-0 overflow-hidden rounded-2xl border border-border shadow-2xl"
          style={{ backfaceVisibility: "hidden" }}
        >
          <img
            src={cardBackImage}
            alt="카드 뒷면"
            className="h-full w-full object-cover"
          />
          {!revealed && (
            <div className="absolute inset-0 flex items-end justify-center pb-6">
              <span className="shimmer rounded-full bg-muted/80 px-4 py-2 text-sm text-foreground backdrop-blur-sm">
                탭하여 카드 뒤집기
              </span>
            </div>
          )}
        </div>

        {/* 카드 앞면 */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card p-6 shadow-2xl"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <span className="text-6xl">{card.emoji}</span>
          <h2 className="text-gold text-xl font-bold">{card.nameKo}</h2>
          <p className="text-sm text-muted-foreground">{card.name}</p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {card.keywords.map((kw) => (
              <span
                key={kw}
                className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
