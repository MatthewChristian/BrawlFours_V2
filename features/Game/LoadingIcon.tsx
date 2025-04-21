import React from 'react';
import { GiClubs, GiSpades, GiHearts, GiDiamonds } from 'react-icons/gi';

export default function LoadingIcon() {
  return (
    <div className='flex flex-row gap-2'>
      <GiHearts className='loading-icon' color='#dc2626'/>
      <GiSpades className='loading-icon' color='black' />
      <GiDiamonds className='loading-icon' color='#dc2626' />
      <GiClubs className='loading-icon' color='black' />
    </div>
  );
}
