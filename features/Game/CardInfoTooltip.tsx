import React, { useMemo } from 'react'
import Image from 'next/image';
import { Tooltip } from 'react-tooltip'
import { DeckCard } from '../../models/DeckCard'
import { getCardAnchorSelect, getCardShortcode } from '../../core/services/parseCard';
import { getAbilityData } from '../../core/services/abilities';
import powerSvg from "../../public/images/power.svg";

interface Props {
  card: DeckCard;
  active?: boolean;
  offsetY?: number;
}

export default function CardInfoTooltip({ card, active, offsetY }: Props) {

  const anchorSelect = useMemo(() => {
    return getCardAnchorSelect(card);
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
            <div className='relative top-1'>
              <Image priority
                src={powerSvg}
                alt="" />
            </div>
            <div className='text-green-500'>{card.power} Power</div>
          </div>
          <div className='border-t-2 border-white'></div>
          <div className='text-amber-500'>{card.points} Points</div>
          <div className='border-t-2 border-white'></div>
          <div>{getAbilityData(card?.ability)?.description}</div>
        </div>
      </Tooltip>
    : undefined
  )
}
