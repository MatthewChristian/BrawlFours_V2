import React, { RefObject, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { DeckCard } from '../../models/DeckCard';
import { getCardShortcode } from '../../core/services/parseCard';
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from '../../store/hooks';


interface Props {
  player?: number;
  cardData?: DeckCard;
  onClickHandler?: (val?: DeckCard, player?: number) => void;
  isDeckCard?: boolean;
  className?: string;
  style?: React.CSSProperties
  isOutline?: boolean;
  liftPlayer?: number;
  coords?: DOMRect[];
}

export default function PlayingCard({
  className,
  style,
  onClickHandler,
  player,
  cardData,
  isDeckCard,
  isOutline,
  liftPlayer,
  coords
}: Props) {

  const dispatch = useAppDispatch();

  const cardRef = useRef<HTMLDivElement>(null);

  const [y, setY] = useState(0);
  const [x, setX] = useState(0);

  const [focused, setFocused] = useState<boolean>(false);

  const card = useMemo(() => {
    return getCardShortcode(cardData);
  }, [cardData]);

  function getCoords() {
    const cardCoords = cardRef?.current?.getBoundingClientRect();

    if (!cardCoords) {
      return;
    }

    return { x: coords[liftPlayer - 1].x - cardCoords.x, y: coords[liftPlayer - 1].y - cardCoords.y}
  }

  function handleClick() {
    if (onClickHandler) {
      onClickHandler(cardData, player)
    }
  }

  useEffect(() => {
    if (!focused) {
      setY(0);
    }
    else {
      setY(-20);
    }
  }, [focused]);

  useEffect(() => {
    console.log("Coords: ", coords);
  }, [coords]);


  return (
    <div
      ref={cardRef}
      className={`${className}`}
      onClick={handleClick}
      style={style}>
      { !isDeckCard ? (
        card ?
          <motion.div
            animate={{ x, y }}
            transition={{ type: liftPlayer ? "keyframes" : "spring" }}
            initial={coords ? getCoords() : undefined}
          >
            <div
              style={{position: 'relative', height: 120, width: 80 }}
              onMouseOver={() => cardData?.playable && !isOutline ? setFocused(true) : undefined}
              onMouseLeave={() => setFocused(false)}
            >
              <Image
                src={`/images/${card}.png`}
                fill
                sizes="10vw"
                style={{ objectFit: 'fill' }}
                alt='card'
                className={`${cardData?.playable && !isOutline ? 'blue-glow' : ''}`}
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