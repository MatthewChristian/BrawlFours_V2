import React, { HTMLAttributes, useMemo } from 'react';
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

export default function PlayingCard({ className, style, iter, len, onClickHandler, player, cardData, isDeckCard, isKickedCard, isTeam2Card  }: Props) {

  const card = useMemo(() => {
    return getCardShortcode(cardData);
  }, [cardData]);

  const horizontalGap = 4;
  const verticalGap = 3;


  const p1Start = useMemo(() => {
    const tempLen = len ?? 0;
    return 49 + (horizontalGap * (tempLen - 6)) - (horizontalGap * ((tempLen - 6) / 3)) - ((tempLen - 6) / 2);
  }, [len]);

  const p2Start = useMemo(() => {
    const tempLen = len ?? 0;
    return 34 - (verticalGap * (tempLen - 6)) + (verticalGap * ((tempLen - 6) / 3)) + ((tempLen - 6) / 2);
  }, [len]);

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