import React from 'react';
import StatusIcon from '../../../core/components/StatusIcon';
import Image from 'next/image';
import hangSaverSvg from "../../../public/images/statusIcons/hangSaver.svg";


interface Props {
  active?: boolean;
}

export default function HangSaverIcon({ active }: Props) {
  return (
    <StatusIcon
      icon={<Image priority
        src={hangSaverSvg}
        alt="" />}
      twBgColour='bg-blue-200'
      twBorderColour='border-blue-600'
      tooltip="This team's Jack will be saved from being hung this round"
      shortcode='hangSaver'
      active={active}
    />
  );
}
