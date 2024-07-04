import React, { RefObject } from 'react';
import Gameboard from '../../features/Game/Gameboard';
import { Socket } from 'socket.io-client';
import { useRouter } from 'next/router';

interface Props {
  socket: RefObject<Socket>;
}

export default function GamePage({ socket }: Props) {

  const router = useRouter();

  return (
    <div>
      <Gameboard socket={socket} roomId={router.query.roomId ? router.query.roomId.toString() : undefined}/>
    </div>
  );
}
