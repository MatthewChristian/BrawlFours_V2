import React from 'react';
import StatusIcon from '../../../core/components/StatusIcon';
import Image from 'next/image';
import noWinLiftSvg from "../../../public/images/statusIcons/noWinLift.svg";


interface Props {
  active?: boolean;
}

export default function NoWinLiftIcon({ active }: Props) {
  return (
    active ?
      <StatusIcon
        icon={<Image priority
          src={noWinLiftSvg}
          alt="" />}
        twBgColour='bg-red-200'
        twBorderColour='border-red-600'
        tooltip='Nobody can win this lift!'
        shortcode='noWinLift'
      />
      : <></>
  );
}