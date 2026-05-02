import { useState } from 'react';
import type { TarotCard } from '@/types/tarot';
import { spacingPx } from '@/design/tokens';

interface CardThumbProps {
  card: Pick<TarotCard, 'imageUrl' | 'emoji'>;
  size: number;
  emojiFontSize?: string | number;
}

/** 카드 썸네일. 이미지 로드 실패 시 emoji로 폴백 (?-broken icon 방지). */
export default function CardThumb({ card, size, emojiFontSize }: CardThumbProps) {
  const [errored, setErrored] = useState(false);
  const showImage = card.imageUrl && !errored;

  if (showImage) {
    return (
      <img
        src={card.imageUrl}
        alt=""
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setErrored(true)}
        style={{
          width: size,
          height: size,
          objectFit: 'contain',
          borderRadius: spacingPx('sm'),
          flexShrink: 0,
        }}
      />
    );
  }
  return (
    <span style={{ fontSize: emojiFontSize ?? size * 0.6, flexShrink: 0 }} aria-hidden>
      {card.emoji}
    </span>
  );
}
