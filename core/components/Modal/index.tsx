import React, { ReactNode } from 'react';
import Popup from 'reactjs-popup';
import { PopupProps } from 'reactjs-popup/dist/types';

interface Props extends PopupProps {
  children: ReactNode;
}

export default function Modal({ children, ...props }: Props) {
  return (
    <Popup modal {...props} className={props.className} contentStyle={props.contentStyle ?? { width: '25em'}}>
      {children}
    </Popup>
  );
}
