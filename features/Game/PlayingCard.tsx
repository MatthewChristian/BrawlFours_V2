import React, { RefObject, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { DeckCard } from '../../models/DeckCard';
import { getCardShortcode } from '../../core/services/parseCard';
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { delay } from '../../core/services/delay';
import { getPlayer1HandPos, getPlayer2HandPos, getPlayer3HandPos, getPlayer4HandPos } from '../../slices/position.slice';


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
  spotlighted?: boolean;
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
  liftWinner,
  spotlighted
}: Props) {

  const cardRef = useRef<HTMLDivElement>(null);

  const [y, setY] = useState(0);
  const [x, setX] = useState(0);

  const [focused, setFocused] = useState<boolean>(false);

  const player1HandPos = useAppSelector(getPlayer1HandPos);
  const player2HandPos = useAppSelector(getPlayer2HandPos);
  const player3HandPos = useAppSelector(getPlayer3HandPos);
  const player4HandPos = useAppSelector(getPlayer4HandPos);

  const card = useMemo(() => {
    return getCardShortcode(cardData);
  }, [cardData]);

  function handleClick() {
    if (!isNotPlayable && onClickHandler) {
      onClickHandler(cardData, player);
    }
  }

  async function handleLiftWinner() {
    const num1 = 60;
    const num2 = 140;
    const num3 = 170;
    const num4 = 220;

    await delay(850);

    const cardPos = cardRef.current.getBoundingClientRect();
    const cardX = cardPos.left + cardPos.width / 2;
    const cardY = cardPos.y + cardPos.height / 2

    if (liftWinner == 1) {
      setY(player1HandPos.y - cardY);
      setX(player1HandPos.x - cardX);
    }

    else if (liftWinner == 2) {
      setY(player2HandPos.y - cardY);
      setX(player2HandPos.x - cardX);
    }

    else if (liftWinner == 3) {
      setY(player3HandPos.y - cardY);
      setX(player3HandPos.x - cardX);
    }

    else if (liftWinner == 4) {
      setY(player4HandPos.y - cardY);
      setX(player4HandPos.x - cardX);
    }
  }

  function getGlowClassName() {

    if (cardData.power == 0) {
      return 'red-glow';
    }

    if (isNotPlayable) {
      return '';
    }

    // Lift card would normally have isNotPlayable set to true, if it is false then that means the lift card is being targetted by an ability
    if (liftCard) {
      return 'blue-glow';
    }

    if (cardData.playable) {
      if (cardData.trump) {
        return 'gold-glow';
      }

      return 'blue-glow';
    }

    return '';
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
      style={{ zIndex: spotlighted ? 9999 : liftCard ? 10 : undefined, ...style}}>
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
                className={getGlowClassName()}
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