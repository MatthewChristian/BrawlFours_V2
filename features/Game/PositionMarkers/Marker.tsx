import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { useAppDispatch } from '../../../store/hooks';
import { UnknownAction } from '@reduxjs/toolkit';
import { MarkerPosition } from '../../../models/MarkerPosition';
import { useWindowSize } from '../../../core/services/useWindowSize';

interface Props {
  dispatchFunction: (payload?: MarkerPosition) => UnknownAction;
}

export default function Marker({ dispatchFunction }: Props) {

  const markerRef = useRef<HTMLDivElement>(null);

  const windowSize = useWindowSize();

  const dispatch = useAppDispatch();

  useEffect(() => {
    const pos = markerRef.current.getBoundingClientRect();

    const centerPos = {
      x: pos.left + pos.width / 2,
      y: pos.y + pos.height / 2
    };

    dispatch(dispatchFunction(centerPos));
  }, [windowSize]);

  return (
    <div ref={markerRef} className='absolute h-1 w-1'>

    </div>
  );
}
