import React from 'react';
import StatusIcon from '../../../core/components/StatusIcon';
import Image from 'next/image';
import twoWinGameSvg from "../../../public/images/statusIcons/twoWinGame.svg";


interface Props {
  active?: boolean;
}

export default function TwoWinGameIcon({ active }: Props) {
  return (
    active ?
      <StatusIcon
        icon={<Image priority
          src={twoWinGameSvg}
          alt="" />}
        twBgColour='bg-amber-200'
        twBorderColour='border-amber-600'
        tooltip="The team who played the two of clubs will win game!"
        shortcode='twoWinGame'
      />
      : <></>
  );
}
