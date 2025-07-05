import React, { ReactNode } from 'react';
import Popup from 'reactjs-popup';
import { PopupProps } from 'reactjs-popup/dist/types';
import { useAppSelector } from '../../../store/hooks';
import { getMobileView } from '../../../slices/game.slice';

interface Props extends PopupProps {
  children: ReactNode;
  centered?: boolean;
}

export default function Modal({ children, centered, ...props }: Props) {

  const mobileView = useAppSelector(getMobileView);

  return (
    <Popup modal {...props} className={`${props.className} ${centered || mobileView ? 'centered-modal' : ''}`} contentStyle={props.contentStyle ?? { width: mobileView ? '80vw' : '25em' }}>
      {children}
    </Popup>
  );
}
