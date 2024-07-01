import React, { useMemo } from 'react';
import Image from 'next/image'
import { getCardShortcode } from '../core/services/parseCard';
import { DeckCard } from '../models/DeckCard';

interface Props {
  cardData?: DeckCard;
  onClickHandler?: (val?: DeckCard, player?: number) => void;
}

export default function PlayingCardKicked({ cardData, onClickHandler }: Props) {

    const card = useMemo(() => {
      getCardShortcode(cardData);
    }, [cardData])

    return (
        <div className="col-sm-3" onClick={() => onClickHandler ? onClickHandler() : undefined}>
          <Image
            src={`/images/${card}.png`}
            width={140}
            height={190}
            alt='card'
          />
        </div>
    )
}