import React from 'react';
import StatusIcon from '../../../core/components/StatusIcon';
import Image from 'next/image';
import nextCardTrumpSvg from '../../../public/images/statusIcons/nextCardTrump.svg';


interface Props {
  active?: boolean;
}

export default function NextCardTrumpIcon({ active }: Props) {
  return (
    <StatusIcon
      icon={<Image priority
        src={nextCardTrumpSvg}
        alt="" />}
      twBgColour='bg-amber-200'
      twBorderColour='border-amber-600'
      tooltip='The next card this player plays will count as trump'
      shortcode='nextCardTrump'
      active={active}
    />
  );
}
