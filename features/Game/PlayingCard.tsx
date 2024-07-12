import React, { useMemo } from 'react';
import Image from 'next/image';
import { DeckCard } from '../../models/DeckCard';
import { getCardShortcode } from '../../core/services/parseCard';

interface Props {
  player?: number;
  cardData?: DeckCard;
  onClickHandler?: (val?: DeckCard, player?: number) => void;
  isDeckCard?: boolean;
  className?: string;
  style?: React.CSSProperties
  isOutline?: boolean;
}

export default function PlayingCard({ className, style, onClickHandler, player, cardData, isDeckCard, isOutline }: Props) {

  const card = useMemo(() => {
    return getCardShortcode(cardData);
  }, [cardData]);

  return (
    <div className={`${className}`}
      onClick={() => onClickHandler ? onClickHandler(cardData, player) : undefined}
      style={style}>
      { !isDeckCard ? (
        card ?
          <div style={{position: 'relative', height: 120, width: 80 }}>
            <Image
              src={`/images/${card}.png`}
              fill
              style={{ objectFit: 'contain' }}
              alt='card'
            />
          </div>
          : isOutline ?
            <div style={{ position: 'relative', height: 120, width: 80 }}>
              <Image
                src={'/images/card-outline.png'}
                fill
                style={{ objectFit: 'contain' }}
                alt='card'
              />
            </div>
            : null
      )
        :
        (
          <div style={{ position: 'relative', height: 120, width: 80}}>
            <Image
              src={'/images/red_back.png'}
              fill
              style={{ objectFit: 'contain' }}
              alt='card'
            />
          </div>
        ) }
    </div>
  );
}