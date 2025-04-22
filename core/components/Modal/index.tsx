import React, { ReactNode } from 'react';
import Popup from 'reactjs-popup';
import { PopupProps } from 'reactjs-popup/dist/types';

interface Props extends PopupProps {
  children: ReactNode;
  centered?: boolean;
}

export default function Modal({ children, centered, ...props }: Props) {
  return (
    <Popup modal {...props} className={`${props.className} ${centered ? 'centered-modal' : ''}`} contentStyle={props.contentStyle ?? { width: '25em' }}>
      {children}
    </Popup>
  );
}
