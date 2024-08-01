import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { DeckCard } from '../../models/DeckCard';
import { getCardShortcode } from '../../core/services/parseCard';
import { motion, AnimatePresence } from "framer-motion";

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

  const [y, setY] = useState(0);

  const [focused, setFocused] = useState<boolean>(false);

  const card = useMemo(() => {
    return getCardShortcode(cardData);
  }, [cardData]);

  useEffect(() => {
    if (!focused) {
      setY(0);
    }
    else {
      setY(-20);
    }
  }, [focused]);

  return (
    <div className={`${className}`}
      onClick={() => onClickHandler ? onClickHandler(cardData, player) : undefined}
      style={style}>
      { !isDeckCard ? (
        card ?
          <motion.div
            animate={{ y }}
            transition={{ type: "spring" }}
            exit={{ y: -30, opacity: 0 }}
          >
            <div
              style={{position: 'relative', height: 120, width: 80 }}
              onMouseOver={() => cardData.playable && !isOutline ? setFocused(true) : undefined}
              onMouseLeave={() => setFocused(false)}
            >
              <Image
                src={`/images/${card}.png`}
                fill
                sizes="10vw"
                style={{ objectFit: 'fill' }}
                alt='card'
                className={`${cardData.playable && !isOutline ? 'blue-glow' : ''}`}
              />
            </div>
          </motion.div>
          : isOutline ?
            <div style={{ position: 'relative', height: 120, width: 80 }}>
              <Image
                src={'/images/card-outline.png'}
                fill
                style={{ objectFit: 'fill' }}
                sizes="10vw"
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
              style={{ objectFit: 'fill' }}
              sizes="10vw"
              alt='card'
            />
          </div>
        ) }
    </div>
  );
}