import React from 'react';
import StatusIcon from '../../../core/components/StatusIcon';
import Image from 'next/image';
import doubleLiftSvg from '../../../public/images/statusIcons/doubleLift.svg';


interface Props {
  active?: boolean;
}

export default function DoubleLiftIcon({ active }: Props) {
  return (
    <StatusIcon
      icon={<Image priority
        src={doubleLiftSvg}
        alt="" />}
      twBgColour='bg-green-200'
      twBorderColour='border-green-600'
      tooltip='The winner of the lift next turn wins both lifts!'
      shortcode='doubleLift'
      active={active}
    />
  );
}
