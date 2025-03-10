'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import Room from '../../features/Game/Room';

export default function GamePage() {

  const searchParams = useSearchParams();

  const roomId = searchParams.get('roomId');

  return (
    <div>
      <Room roomId={roomId ? roomId.toString() : undefined} />
    </div>
  );
}
