import React, { RefObject } from 'react'
import Room from '../../features/Room'
import { Socket } from 'socket.io-client';
import { useRouter } from 'next/router';

interface Props {
  socket: RefObject<Socket>;
}

export default function RoomPage({ socket }: Props) {
  const router = useRouter();

  return (
    <div>
      <Room socket={socket} roomId={router.query.room_id?.toString()} />
    </div>
  )
}
