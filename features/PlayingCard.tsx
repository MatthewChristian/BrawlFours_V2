import React, { useMemo } from 'react';
import Image from 'next/image'
import { DeckCard } from '../models/DeckCard';
import { getCardShortcode } from '../core/services/parseCard';

interface Props {
  len?: number;
  player?: number;
  iter?: number;
  cardData?: DeckCard;
  onClickHandler?: (val?: DeckCard, player?: number) => void;
  isDeckCard?: boolean;
  isKickedCard?: boolean;
  cardClassName?: string;
}

export default function PlayingCard({ iter, len, onClickHandler, player, cardData, isDeckCard, isKickedCard, cardClassName }: Props) {

  const card = useMemo(() => {
    return getCardShortcode(cardData);
  }, [cardData]);

    let horizontalGap = 4;
    let verticalGap = 3;


  const p1Start = useMemo(() => {
    const tempLen = len ?? 0;
    return 52 + (horizontalGap * (tempLen - 6)) - (horizontalGap * ((tempLen - 6) / 3)) - ((tempLen - 6) / 2);
  }, [len]);

  const p2Start = useMemo(() => {
    const tempLen = len ?? 0;
    return 34 - (verticalGap * (tempLen - 6)) + (verticalGap * ((tempLen - 6) / 3)) + ((tempLen - 6) / 2);
  }, [len]);

    return (
      <div className={`playing-card card-${cardClassName} player-card-${player} ${isKickedCard ? 'player-card-kicked' : ''}`}
        onClick={() => onClickHandler ? onClickHandler(cardData, player) : undefined}
          style={{
            position: 'absolute',
            right: (player == 1 || player == 3) ? `${p1Start - (horizontalGap * (iter ?? 0))}%` : undefined,
            top: (player == 2 || player == 4) ? `${p2Start + (verticalGap * (iter ?? 0))}%` : undefined,
          }}>
          { !isDeckCard ? (
            card &&
              <Image
                src={`/images/${card}.png`}
                width={78.5}
                height={120}
                alt='card'
              />
          ) : (
          <Image
            src={`/images/red_back.png`}
            width={78.5}
            height={120}
            alt='card'
          />
          ) }
        </div>
    )
}