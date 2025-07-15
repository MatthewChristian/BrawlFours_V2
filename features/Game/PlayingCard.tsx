import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { DeckCard } from '../../models/DeckCard';
import { getCardAnchorSelect, getCardShortcode } from '../../core/services/parseCard';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { delay } from '../../core/services/delay';
import { getPlayer1HandPos, getPlayer2HandPos, getPlayer3HandPos, getPlayer4HandPos } from '../../slices/position.slice';
import CardInfoTooltip from './CardInfoTooltip';
import { getFocusedCard, getIsMobile, getMobileView, getTwosPlayed, setFocusedCard } from '../../slices/game.slice';
import { CardAbilities } from '../../core/services/abilities';
import { TooltipRefProps } from 'react-tooltip';



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
  glow?: string;
  flipped?: boolean;
  spin?: boolean;
  isKickedCard?: boolean;
  ignoreMobileClick?: boolean;
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
  spotlighted,
  glow,
  flipped,
  spin,
  isKickedCard,
  ignoreMobileClick
}: Props) {

  const mobileView = useAppSelector(getMobileView);
  const isMobileState = useAppSelector(getIsMobile);

  const tooltipRef = useRef<TooltipRefProps>(null);

  const dispatch = useAppDispatch();

  const cardHeight = mobileView ? (isKickedCard ? '10dvh' : '12dvh') : '15dvh';
  const aspectRatio = '3/5';

  const cardRef = useRef<HTMLDivElement>(null);

  const [y, setY] = useState<number>(0);
  const [x, setX] = useState<number>(0);

  const [focused, setFocused] = useState<boolean>(false);

  const focusedCard = useAppSelector(getFocusedCard);

  const twosPlayed = useAppSelector(getTwosPlayed);

  const player1HandPos = useAppSelector(getPlayer1HandPos);
  const player2HandPos = useAppSelector(getPlayer2HandPos);
  const player3HandPos = useAppSelector(getPlayer3HandPos);
  const player4HandPos = useAppSelector(getPlayer4HandPos);

  const card = useMemo(() => {
    return getCardShortcode(cardData);
  }, [cardData]);

  const anchorSelect = useMemo(() => {
    return getCardAnchorSelect(cardData);
  }, [cardData]);

  const isMobile = useMemo(() => {
    return isMobileState && !ignoreMobileClick;
  }, [isMobileState, ignoreMobileClick]);

  const tooltipEnabled = useMemo(() => {
    return (!isDeckCard && cardData) ? true : false;
  }, [cardData, isDeckCard]);

  const isTwoWinGameActive = useMemo(() => {
    if (cardData?.ability != CardAbilities.twoWinGame) {
      return;
    }

    if (twosPlayed?.length == 3) {
      return true;
    }

    return false;
  }, [twosPlayed, cardData]);

  function handleClick() {
    if (!isNotPlayable && onClickHandler) {
      onClickHandler(cardData, player);
    }
  }

  async function handleLiftWinner() {

    await delay(850);

    const cardPos = cardRef.current.getBoundingClientRect();
    const cardX = cardPos.left + cardPos.width / 2;
    const cardY = cardPos.y + cardPos.height / 2;

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

    if (glow) {
      return `${glow}-glow`;
    }

    if (cardData?.power == 0) {
      return 'red-glow';
    }

    if (liftCard && cardData?.trump) {
      return 'gold-glow';
    }

    if (isNotPlayable) {
      return '';
    }

    // Lift card would normally have isNotPlayable set to true, if it is false then that means the lift card is being targetted by an ability
    if (liftCard) {
      return 'blue-glow';
    }

    if (cardData?.playable) {
      if (isTwoWinGameActive) {
        return 'purple-glow';
      }
      else if (cardData?.trump) {
        return 'gold-glow';
      }

      return 'blue-glow';
    }

    return '';
  }

  function handleMobileClick() {
    if (cardData?.playable && !isNotPlayable) {
      dispatch(setFocusedCard(card));
    }
  }

  function handleMobileTouchEnd(e: React.TouchEvent<HTMLDivElement>) {

    const touch = e.changedTouches[0]; // Get the touch that ended
    const endTarget = document.elementFromPoint(touch.clientX, touch.clientY);

    if (cardRef.current && cardRef.current.contains(endTarget) && card == focusedCard) {
      handleClick();
    }

    dispatch(setFocusedCard(undefined));
    tooltipRef.current?.close();

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
    if (!isMobile) {
      return;
    }

    if (focusedCard && focusedCard == card) {
      setY(-20);
    }
    else {
      setY(0);
    }
  }, [focusedCard, isMobile]);



  useEffect(() => {
    if (!liftWinner || !liftCard) {
      setX(0);
      setY(0);
      return;
    }

    handleLiftWinner();
  }, [liftWinner, liftCard]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        dispatch(setFocusedCard(undefined));
        tooltipRef.current?.close();
      }
    }

    if (isMobile) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobile]);

  return (
    <>
      <CardInfoTooltip
        tooltipRef={tooltipRef}
        card={cardData}
        active={tooltipEnabled}
        offsetY={isMobile ? y : -y}
        ignoreMobileClick={ignoreMobileClick}
      />

      <div
        ref={cardRef}
        className={`${className} ${anchorSelect}`}
        onClick={() => { isMobile ? handleMobileClick() : handleClick();}}
        onTouchEnd={(e) => isMobile ? handleMobileTouchEnd(e) : undefined }
        style={{ zIndex: spotlighted ? 99999 : liftCard ? 10 : 20, ...style }}
      >
        <motion.div
          className="card-container"
          style={{
            aspectRatio: aspectRatio,
            height: cardHeight,
            perspective: '1000px', // Adds depth for 3D animation
          }}
        >
          <AnimatePresence>
            <motion.div
              className="card"
              animate={{ rotateY: flipped ? 180 : 0, rotateZ: spin ? 360 : 0 }} // Animates the flip
              transition={{
                rotateY: { duration: 0.5 },
                rotateZ: { duration: 1 },
              }} // Controls the flip speed
              style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                transformStyle: 'preserve-3d', // Enables 3D effect
              }}
            >
              {/* Front Side */}
              <motion.div
                className="card-front"
                style={{
                  position: 'absolute',
                  backfaceVisibility: 'hidden', // Ensures only one side is visible
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >

                {!isDeckCard ? (
                  card ?
                    <motion.div
                      animate={{ x, y }}
                      transition={{ type: liftWinner ? 'tween' : 'spring' }}
                      initial={liftCard == 1 ? { y: 20 } : liftCard == 2 ? { x: 20 } : liftCard == 3 ? { y: -20 } : liftCard == 4 ? { x: -20 } : undefined}
                    >
                      <div
                        style={{ position: 'relative', height: cardHeight, aspectRatio: aspectRatio }}
                        onMouseOver={isMobileState ? undefined : () => (cardData?.playable && !isNotPlayable) || glow == 'blue' ? setFocused(true) : undefined}
                        onMouseLeave={isMobileState ? undefined : () => setFocused(false)}
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
                      <div style={{ position: 'relative', height: cardHeight, aspectRatio: aspectRatio }}>
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
                    <div style={{ position: 'relative', height: cardHeight, aspectRatio: aspectRatio }}>
                      <Image
                        src={'/images/red_back.png'}
                        fill
                        style={{ objectFit: 'fill' }}
                        sizes="10vw"
                        alt='card'
                      />
                    </div>
                  )}

              </motion.div>

              {/* Back Side */}
              <motion.div
                className="card-back"
                style={{
                  position: 'absolute',
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)', // Flips the back face
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <div style={{ position: 'relative', height: cardHeight, aspectRatio: aspectRatio }}>
                  <Image
                    src={'/images/red_back.png'}
                    fill
                    style={{ objectFit: 'fill' }}
                    sizes="10vw"
                    alt='card'
                  />
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
}