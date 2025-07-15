import React, { RefObject, useMemo } from 'react';
import Image from 'next/image';
import { Tooltip, TooltipRefProps } from 'react-tooltip';
import { DeckCard } from '../../models/DeckCard';
import { getCardAnchorSelect, parseSuit } from '../../core/services/parseCard';
import { CardAbilities, getAbilityData } from '../../core/services/abilities';
import powerSvg from '../../public/images/power.svg';
import powerZeroSvg from '../../public/images/powerZero.svg';
import { useAppSelector } from '../../store/hooks';
import { getActiveAbilities, getIsMobile, getMobileView, getTwosPlayed } from '../../slices/game.slice';
import { oppositePowerMap } from '../../core/services/sharedGameFunctions';
import { FaCrown } from 'react-icons/fa';

interface Props {
  tooltipRef: RefObject<TooltipRefProps>;
  card: DeckCard;
  active?: boolean;
  offsetY?: number;
  ignoreMobileClick?: boolean;
}

export default function CardInfoTooltip({ tooltipRef, card, active, offsetY, ignoreMobileClick }: Props) {

  const activeAbilities = useAppSelector(getActiveAbilities);
  const twosPlayed = useAppSelector(getTwosPlayed);
  const mobileView = useAppSelector(getMobileView);
  const isMobile = useAppSelector(getIsMobile) && !ignoreMobileClick;

  const isDisabled = useMemo(() => {
    if (activeAbilities?.includes(CardAbilities.abilitiesDisabled)) {
      return true;
    }

    return false;
  }, [activeAbilities]);

  const isOppositePower = useMemo(() => {
    if (activeAbilities?.includes(CardAbilities.oppositePower)) {
      return true;
    }

    return false;
  }, [activeAbilities]);

  const anchorSelect = useMemo(() => {
    return getCardAnchorSelect(card);
  }, [card]);

  const abilityDescription = useMemo(() => {
    return getAbilityData(card?.ability)?.description;
  }, [card]);

  const cardPoints = useMemo(() => {
    if (card?.abilityPoints && !isDisabled) {
      return card.abilityPoints;
    }
    else {
      return card?.points;
    }
  }, [card, isDisabled]);

  const cardPower = useMemo(() => {
    if (!card?.power) {
      return 0;
    }

    if (!isOppositePower) {
      return card.power;
    }
    else {
      return oppositePowerMap(card.power);
    }
  }, [card, isOppositePower]);

  function formatTwosPlayed() {
    if (!twosPlayed || twosPlayed.length == 0) {
      return 'None';
    }

    let twosPlayedStr = '';

    twosPlayed.forEach((el, i) => {

      twosPlayedStr = twosPlayedStr + parseSuit(el);

      if (i < twosPlayed.length - 1) {
        twosPlayedStr = twosPlayedStr + ', ';
      }
    });

    return twosPlayedStr;
  }

  return (
    active ?
      <Tooltip
        ref={tooltipRef}
        anchorSelect={`.${anchorSelect}`}
        place={mobileView ? 'bottom-start' : 'top'}
        delayShow={mobileView ? 0 : 550}
        delayHide={mobileView ? 0 : 150}
        offset={(offsetY ?? 0) + 10}
        style={{ zIndex: 20000, minWidth: 250, maxWidth: mobileView ? '80dvw' : 250 }}
        openOnClick={isMobile}
        className={'border border-white'}
        classNameArrow={'border border-white border-t-0 border-l-0'}
      >
        <div className='flex flex-col gap-2'>
          <div className='grid grid-cols-2 gap-2'>
            <div className='flex flex-row gap-1 items-baseline'>
              <div className='relative top-1 w-5'>
                <Image priority
                  src={card.power == 0 ? powerZeroSvg : powerSvg}
                  alt="" />
              </div>
              <div className={card.power == 0 ? 'text-red-500' : 'text-green-500'}>{cardPower} Power</div>
            </div>

            { card.trump &&
              <div className='flex flex-row gap-1 items-baseline'>
                <div className='relative top-1 w-5'>
                  <FaCrown color='#facc15' size={20} />
                </div>
                <div className={'text-yellow-400'}>Trump</div>
              </div>
            }
          </div>

          <div className='border-t-2 border-white'></div>

          <div className='flex flex-row gap-1 items-center'>
            <div className='w-5 flex justify-center'>
              <div className={`rounded-full h-3 w-3 border-2 ${cardPoints == 0 ? 'border-red-700 bg-red-500' : 'border-amber-600 bg-amber-500'} `}></div>
            </div>
            <div className={`${cardPoints == 0 ? 'text-red-500' : 'text-amber-500'} relative top-[2px]`}>{cardPoints} {cardPoints == 1 ? 'Point' : 'Points'}</div>
          </div>

          {abilityDescription ?
            <div className='border-t-2 border-white'></div>
            : <></>
          }

          <div className={isDisabled && card.ability != CardAbilities.abilitiesDisabled ? 'text-red-500 flex flex-col gap-1' : ''}>
            {isDisabled && card.ability != CardAbilities.abilitiesDisabled && abilityDescription ? <div>ABILITY DISABLED</div> : undefined}
            {abilityDescription}
          </div>

          {
            card?.ability == CardAbilities.twoWinGame ?
              <div className='text-xs text-gray-400 italic'>
                Twos Played: {formatTwosPlayed()}
              </div> : null
          }

          {
            card?.ability == CardAbilities.swapHands ?
              <div className='text-xs text-gray-400 italic'>
                If the chosen player has more cards, then one random card in their hand will not be swapped
              </div> : null
          }

          {
            card?.ability == CardAbilities.oppositePower ?
              <div className='text-xs text-gray-400 italic'>
                Trump still beats non-Trump
              </div> : null
          }

          {
            card?.isRandom ?
              <div className='text-xs text-gray-400 italic'>
                This card&apos;s ability is random every game
              </div>
              :
              null
          }
        </div>

      </Tooltip>
      : undefined
  );
}
