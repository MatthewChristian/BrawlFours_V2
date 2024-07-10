import React, { useMemo } from 'react';
import Image from 'next/image';
import { DeckCard } from '../../models/DeckCard';
import { getCardShortcode } from '../../core/services/parseCard';

interface Props {
  len?: number;
  player?: number;
  iter?: number;
  cardData?: DeckCard;
  onClickHandler?: (val?: DeckCard, player?: number) => void;
  isDeckCard?: boolean;
  isKickedCard?: boolean;
  isTeam2Card?: boolean;
  className?: string;
  style?: React.CSSProperties
}

export default function PlayingCard({ className, style, onClickHandler, player, cardData, isDeckCard }: Props) {

  const card = useMemo(() => {
    return getCardShortcode(cardData);
  }, [cardData]);

  return (
    <div className={`${className}`}
      onClick={() => onClickHandler ? onClickHandler(cardData, player) : undefined}
      style={style}>
      { !isDeckCard ? (
        card &&
        <div style={{position: 'relative', height: 120, width: 80 }}>
          <Image
            src={`/images/${card}.png`}
            fill
            style={{ objectFit: 'contain' }}
            alt='card'
          />
        </div>
      ) : (
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