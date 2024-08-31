import React from 'react';
import StatusIcon from '../../../core/components/StatusIcon';
import Image from 'next/image';
import oppositePowerSvg from "../../../public/images/statusIcons/oppositePower.svg";


interface Props {
  active?: boolean;
}

export default function OppositePowerIcon({ active }: Props) {
  return (
    <StatusIcon
      icon={<div className='mx-[3px] mt-[1px]'><Image priority
        src={oppositePowerSvg}
        alt="" /></div>}
      twBgColour='bg-blue-200'
      twBorderColour='border-blue-600'
      tooltip='Card power is reversed this turn!'
      shortcode='oppositePower'
      active={active}
    />
  );
}
