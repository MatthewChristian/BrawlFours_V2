import React from 'react';
import StatusIcon from '../../../core/components/StatusIcon';
import Image from 'next/image';
import allyPlaysLastSvg from "../../../public/images/statusIcons/allyPlaysLast.svg";


interface Props {
  active?: boolean;
}

export default function AllyPlaysLastIcon({ active }: Props) {
  return (
    active ?
      <StatusIcon
        icon={<Image priority
          src={allyPlaysLastSvg}
          alt="" />}
        twBgColour='bg-green-200'
        twBorderColour='border-green-600'
        tooltip='This player is playing last this turn'
        shortcode='allyPlaysLast'
      />
      : <></>
  );
}
