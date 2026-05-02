import { useState } from 'react';
import type { TarotCard } from '@/types/tarot';
import { Paragraph } from '@toss/tds-mobile';
import { clsx } from 'clsx';
import { layoutPx } from '@/design/tokens';

interface CardRevealProps {
  card: TarotCard;
  revealed: boolean;
  onReveal: () => void;
}

/** 카드 뒤집기 (CSS transition, TDS Paragraph). 외부 이미지 로드 실패 시 이모지 폴백 */
export default function CardReveal({ card, revealed, onReveal }: CardRevealProps) {
  const [frontImageError, setFrontImageError] = useState(false);
  const showFrontImage = card.imageUrl && !frontImageError;

  return (
    <div className="card-perspective" style={{ width: layoutPx('cardWidth') }}>
      <div
        className={clsx('card-inner', revealed && 'card-revealed')}
        onClick={!revealed ? onReveal : undefined}
        role={!revealed ? 'button' : undefined}
        aria-label={!revealed ? '탭하여 카드 뒤집기' : undefined}
      >
        <div className="card-face card-back">
          <img
            src="/TarotCard.png"
            alt=""
            className="card-back-img"
            referrerPolicy="no-referrer"
          />
          {!revealed && (
            <span className="card-tap-hint">탭하여 카드 뒤집기</span>
          )}
        </div>
        <div className="card-face card-front">
          <div className="card-front-image-wrap">
            {showFrontImage ? (
              <img
                src={card.imageUrl}
                alt=""
                className="card-front-img"
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={() => setFrontImageError(true)}
              />
            ) : (
              <span className="card-emoji card-front-emoji" aria-hidden>{card.emoji}</span>
            )}
          </div>
          <div className="card-front-caption">
            <div className="text-gold">
              <Paragraph typography="t5" style={{ margin: 0 }}>
                <Paragraph.Text fontWeight="bold">{card.nameKo}</Paragraph.Text>
              </Paragraph>
            </div>
            <Paragraph typography="t7" style={{ margin: 0 }} className="card-subtitle">
              <Paragraph.Text color="gray">{card.name}</Paragraph.Text>
            </Paragraph>
            <div className="card-keywords">
              {card.keywords.map((kw) => (
                <span key={kw} className="card-keyword">{kw}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
