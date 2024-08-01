'use client';

import React from 'react';
import Gameboard from '../../features/Game/Gameboard';
import { useSearchParams } from 'next/navigation';

export default function GamePage() {

  const searchParams = useSearchParams();

  const roomId = searchParams.get('roomId');

  return (
    <div>
      <Gameboard roomId={roomId ? roomId.toString() : undefined}/>
    </div>
  );
}
