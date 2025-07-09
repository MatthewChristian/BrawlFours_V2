import React from 'react';
import LoadingIcon from '../Game/LoadingIcon';
import Image from 'next/image';
import logoSvg from '../../public/images/logo/logo.svg';

export default function LoadingScreen() {
  return (
    <div className='h-[100dvh] w-screen lobby-bg flex flex-col justify-center items-center'>

      <div className='px-5'>
        <Image priority
          src={logoSvg}
          width={800}
          alt="" />
      </div>

      <div className='mt-5'>
        <LoadingIcon />
      </div>
    </div>
  );
}
