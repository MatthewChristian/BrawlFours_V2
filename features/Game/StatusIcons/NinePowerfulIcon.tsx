import React from 'react';
import StatusIcon from '../../../core/components/StatusIcon';
import Image from 'next/image';
import ninePowerfulSvg from '../../../public/images/statusIcons/ninePowerful.svg';


interface Props {
  active?: boolean;
}

export default function NinePowerfulIcon({ active }: Props) {
  return (
    <StatusIcon
      icon={<Image priority
        src={ninePowerfulSvg}
        alt="" />}
      twBgColour='bg-amber-200'
      twBorderColour='border-amber-600'
      tooltip='The nine of spades is currently the most powerful card!'
      shortcode='ninePowerful'
      active={active}
    />
  );
}
