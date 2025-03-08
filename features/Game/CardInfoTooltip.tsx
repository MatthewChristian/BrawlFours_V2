import React, { useMemo } from 'react'
import Image from 'next/image';
import { Tooltip } from 'react-tooltip'
import { DeckCard } from '../../models/DeckCard'
import { getCardAnchorSelect, parseSuit } from '../../core/services/parseCard';
import { CardAbilities, getAbilityData } from '../../core/services/abilities';
import powerSvg from "../../public/images/power.svg";
import powerZeroSvg from "../../public/images/powerZero.svg";
import { useAppSelector } from '../../store/hooks';
import { getActiveAbilities, getTwosPlayed } from '../../slices/game.slice';
import { oppositePowerMap } from '../../core/services/sharedGameFunctions';

interface Props {
  card: DeckCard;
  active?: boolean;
  offsetY?: number;
}

export default function CardInfoTooltip({ card, active, offsetY }: Props) {

  const activeAbilities = useAppSelector(getActiveAbilities);
  const twosPlayed = useAppSelector(getTwosPlayed);

  const isDisabled = useMemo(() => {
    if (activeAbilities.includes(CardAbilities.abilitiesDisabled)) {
      return true;
    }

    return false;
  }, [activeAbilities]);

  const isOppositePower = useMemo(() => {
    if (activeAbilities.includes(CardAbilities.oppositePower)) {
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
        twosPlayedStr = twosPlayedStr + ', '
      }
    });

    return twosPlayedStr;
  }

  return (
    active ?
      <Tooltip
        anchorSelect={`.${anchorSelect}`}
        place="top"
        delayShow={550}
        delayHide={150}
        offset={(offsetY ?? 0) + 10}
        style={{ zIndex: 10000, width: 200 }}
      >
        <div className='flex flex-col gap-2'>
          <div className='flex flex-row gap-1 items-baseline'>
            <div className='relative top-1 w-5'>
              <Image priority
                src={card.power == 0 ? powerZeroSvg : powerSvg}
                alt="" />
            </div>
            <div className={card.power == 0 ? 'text-red-500' : 'text-green-500'}>{cardPower} Power</div>
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
              card?.isRandom ?
              <div className='text-xs text-gray-400 italic'>
                This card's ability is random every game
              </div>
              :
              null
            }

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
          </div>

      </Tooltip>
    : undefined
  )
}
