import React from 'react';
import StatusIcon from '../../../core/components/StatusIcon';
import Image from 'next/image';
import doublePointsSvg from '../../../public/images/statusIcons/doublePoints.svg';


interface Props {
  active?: boolean;
}

export default function DoublePointsIcon({ active }: Props) {
  return (
    <StatusIcon
      icon={<Image priority
        src={doublePointsSvg}
        alt="" />}
      twBgColour='bg-amber-200'
      twBorderColour='border-amber-600'
      tooltip='This lift is worth double the points for game!'
      shortcode='doublePoints'
      active={active}
    />
  );
}
