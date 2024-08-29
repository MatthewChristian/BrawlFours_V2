import React, { useMemo } from 'react'
import { Tooltip } from 'react-tooltip'
import { DeckCard } from '../../models/DeckCard'
import { getCardAnchorSelect, getCardShortcode } from '../../core/services/parseCard';
import { getAbilityData } from '../../core/services/abilities';

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

      >
        <div>
          <div>Power: {card.power}</div>
          <div></div>
          <div>Worth {card.points} points</div>
          <div></div>
          <div>{getAbilityData(card?.ability)?.description}</div>
        </div>
      </Tooltip>
    : undefined
  )
}
