
import { Socket } from 'socket.io-client';
import Lobby from '../features/Lobby'
import React, { RefObject } from 'react'

interface Props {
  socket: RefObject<Socket>;
}

export default function Home({ socket }: Props) {
  return (
    <div>
      <Lobby socket={socket} />
    </div>
  )
}
