import React from 'react';
import StatusIcon from '../../../core/components/StatusIcon';
import Image from 'next/image';
import chooseStarterSvg from "../../../public/images/statusIcons/chooseStarter.svg";


interface Props {
  active?: boolean;
}

export default function ChooseStarterIcon({ active }: Props) {
  return (
    active ?
      <StatusIcon
        icon={<Image priority
          src={chooseStarterSvg}
          alt="" />}
        twBgColour='bg-blue-200'
        twBorderColour='border-blue-600'
        tooltip='This player is going to play first next turn'
        shortcode='chooseStarter'
      />
      : <></>
  );
}
