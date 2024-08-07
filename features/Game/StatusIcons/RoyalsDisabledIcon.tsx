import React from 'react';
import StatusIcon from '../../../core/components/StatusIcon';
import Image from 'next/image';
import royalsDisabledSvg from "../../../public/images/statusIcons/royalsDisabled.svg";


interface Props {
  active?: boolean;
}

export default function RoyalsDisabledIcon({ active }: Props) {
  return (
    active ?
      <StatusIcon
        icon={<Image priority
          src={royalsDisabledSvg}
          alt="" />}
        twBgColour='bg-red-200'
        twBorderColour='border-red-600'
        tooltip='Royals are disabled from being played for this turn'
        shortcode='royalsDisabled'
      />
      : <></>
  );
}
