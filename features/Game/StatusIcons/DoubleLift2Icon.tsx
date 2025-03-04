import React from 'react';
import StatusIcon from '../../../core/components/StatusIcon';
import Image from 'next/image';
import doubleLiftSvg from "../../../public/images/statusIcons/doubleLift.svg";
import { useAppDispatch } from '../../../store/hooks';
import { setDoubleLiftModalVisible } from '../../../slices/game.slice';


interface Props {
  active?: boolean;
}

export default function DoubleLift2Icon({ active }: Props) {

  const dispatch = useAppDispatch();

  return (
    <StatusIcon
      icon={<Image priority
        src={doubleLiftSvg}
        alt="" />}
      twBgColour='bg-blue-200'
      twBorderColour='border-blue-600'
      tooltip='The winner of this lift wins the previous lift! Click this icon to view cards.'
      shortcode='doubleLift2'
      onClick={() => dispatch(setDoubleLiftModalVisible(true))}
      active={active}
    />
  );
}
