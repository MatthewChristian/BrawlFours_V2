import React from 'react';
import StatusIcon from '../../../core/components/StatusIcon';
import Image from 'next/image';
import trumpDisabledSvg from "../../../public/images/statusIcons/trumpDisabled.svg";


interface Props {
  active?: boolean;
}

export default function TrumpDisabledIcon({ active }: Props) {
  return (
    active ?
      <StatusIcon
        icon={<Image priority
          src={trumpDisabledSvg}
          alt="" />}
        twBgColour='bg-red-200'
        twBorderColour='border-red-600'
        tooltip='Trump is disabled from being played for this turn'
        shortcode='trumpDisabled'
      />
      : <></>
  );
}
