import React, { RefObject, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { DeckCard } from '../../models/DeckCard';
import { getCardShortcode } from '../../core/services/parseCard';
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { delay } from '../../core/services/delay';


interface Props {
  player?: number;
  cardData?: DeckCard;
  onClickHandler?: (val?: DeckCard, player?: number) => void;
  isDeckCard?: boolean;
  className?: string;
  style?: React.CSSProperties
  isOutline?: boolean;
  isNotPlayable?: boolean;
  liftCard?: number;
  liftWinner?: number;
}

export default function PlayingCard({
  className,
  style,
  onClickHandler,
  player,
  cardData,
  isDeckCard,
  isOutline,
  isNotPlayable,
  liftCard,
  liftWinner
}: Props) {

  const cardRef = useRef<HTMLDivElement>(null);

  const [y, setY] = useState(0);
  const [x, setX] = useState(0);

  const [focused, setFocused] = useState<boolean>(false);

  const card = useMemo(() => {
    return getCardShortcode(cardData);
  }, [cardData]);

  function handleClick() {
    if (onClickHandler) {
      onClickHandler(cardData, player)
    }
  }

  async function handleLiftWinner() {
    const num1 = 60;
    const num2 = 140;
    const num3 = 170;
    const num4 = 220;

    await delay(850);

    if (liftWinner == 1) {

      if (liftCard == 1) {
        setY(num1);
      }
      else if (liftCard == 2) {
        setY(num2);
        setX(-num1);
      }
      else if (liftCard == 3) {
        setY(num4);
      }
      else if (liftCard == 4) {
        setY(num2);
        setX(num1);
      }
    }

    else if (liftWinner == 2) {
      if (liftCard == 1) {
        setY(-num2);
        setX(num3)
      }
      else if (liftCard == 2) {
        setX(num1);
      }
      else if (liftCard == 3) {
        setX(num3);
        setY(num2);
      }
      else if (liftCard == 4) {
        setX(num4);
      }
    }

    else if (liftWinner == 3) {
      if (liftCard == 1) {
        setY(-num4);
      }
      else if (liftCard == 2) {
        setY(-num2);
        setX(-num1);
      }
      else if (liftCard == 3) {
        setY(-num1);
      }
      else if (liftCard == 4) {
        setY(-num2);
        setX(num1);
      }
    }

    else if (liftWinner == 4) {
      if (liftCard == 1) {
        setY(-num2);
        setX(-num3)
      }
      else if (liftCard == 2) {
        setX(-num4)
      }
      else if (liftCard == 3) {
        setX(-num3);
        setY(num2);
      }
      else if (liftCard == 4) {
        setX(-num1);
      }
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
    if (!liftWinner || !liftCard) {
      setX(0);
      setY(0);
      return;
    }

    handleLiftWinner();
  }, [liftWinner, liftCard]);

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
            transition={{ type: liftWinner ? "tween" : "spring" }}
            initial={liftCard == 1 ? { y: 20 } : liftCard == 2 ? { x: 20 } : liftCard == 3 ? { y: -20 } : liftCard == 4 ? { x: -20 } : undefined}
          >
            <div
              style={{position: 'relative', height: 120, width: 80 }}
              onMouseOver={() => cardData?.playable && !isNotPlayable ? setFocused(true) : undefined}
              onMouseLeave={() => setFocused(false)}
            >
              <Image
                src={`/images/${card}.png`}
                fill
                sizes="10vw"
                style={{ objectFit: 'fill' }}
                alt='card'
                className={`${cardData?.playable && !isNotPlayable ? 'blue-glow' : ''}`}
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