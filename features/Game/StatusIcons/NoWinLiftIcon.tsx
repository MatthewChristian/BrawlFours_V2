import React from 'react';
import StatusIcon from '../../../core/components/StatusIcon';
import Image from 'next/image';
import noWinLiftSvg from "../../../public/images/statusIcons/noWinLift.svg";


interface Props {
  active?: boolean;
}

export default function NoWinLiftIcon({ active }: Props) {
  return (
    <StatusIcon
      icon={<Image priority
        src={noWinLiftSvg}
        alt="" />}
      twBgColour='bg-red-200'
      twBorderColour='border-red-600'
      tooltip='No team will earn points for game in this lift!'
      shortcode='noWinLift'
      active={active}
    />
  );
}
