import React, { useMemo } from 'react'
import Image from 'next/image';
import { Tooltip } from 'react-tooltip'
import { DeckCard } from '../../models/DeckCard'
import { getCardAnchorSelect } from '../../core/services/parseCard';
import { CardAbilities, getAbilityData } from '../../core/services/abilities';
import powerSvg from "../../public/images/power.svg";
import powerZeroSvg from "../../public/images/powerZero.svg";
import { useAppSelector } from '../../store/hooks';
import { getActiveAbilities } from '../../slices/game.slice';

interface Props {
  card: DeckCard;
  active?: boolean;
  offsetY?: number;
}

export default function CardInfoTooltip({ card, active, offsetY }: Props) {

  const activeAbilities = useAppSelector(getActiveAbilities);

  const isDisabled = useMemo(() => {
    if (activeAbilities.includes(CardAbilities.abilitiesDisabled)) {
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

  return (
    active ?
      <Tooltip
        anchorSelect={`.${anchorSelect}`}
        place="top"
        delayShow={350}
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
            <div className={card.power == 0 ? 'text-red-500' : 'text-green-500'}>{card.power} Power</div>
          </div>

          <div className='border-t-2 border-white'></div>

          <div className='flex flex-row gap-1 items-center'>
            <div className='w-5 flex justify-center'>
              <div className={`rounded-full h-3 w-3 border-2 ${card.points == 0 ? 'border-red-700 bg-red-500' : 'border-amber-600 bg-amber-500'} `}></div>
            </div>
            <div className={`${card.points == 0 ? 'text-red-500' : 'text-amber-500'} relative top-[2px]`}>{card.points} {card.points == 1 ? 'Point' : 'Points'}</div>
          </div>

          {abilityDescription ?
            <div className='border-t-2 border-white'></div>
            : <></>
          }

          <div className={isDisabled ? 'text-red-500 flex flex-col gap-1' : ''}>
            {isDisabled && abilityDescription ? <div>ABILITY DISABLED</div> : undefined}
            {abilityDescription}
          </div>


            {
              card.isRandom ?
              <div className='text-xs text-gray-400 italic'>
                This card's ability is random every game
              </div>
              :
              null
            }
          </div>

      </Tooltip>
    : undefined
  )
}
