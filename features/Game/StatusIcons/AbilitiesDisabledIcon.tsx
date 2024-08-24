import React from 'react';
import StatusIcon from '../../../core/components/StatusIcon';
import Image from 'next/image';
import abilitiesDisabledSvg from "../../../public/images/statusIcons/abilitiesDisabled.svg";


interface Props {
  active?: boolean;
}

export default function AbilitiesDisabledIcon({ active }: Props) {
  return (
    <StatusIcon
      icon={<Image priority
        src={abilitiesDisabledSvg}
        alt="" />}
      twBgColour='bg-red-200'
      twBorderColour='border-red-600'
      tooltip='All other abilities are disabled this turn'
      shortcode='abilitiesDisabled'
      active={active}
    />
  );
}
