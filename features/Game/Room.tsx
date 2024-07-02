import React, { useState, useEffect, RefObject } from 'react';
import { Socket } from 'socket.io-client';
import Button from '../../core/components/Button';

interface Props {
    roomId?: string;
    socket: RefObject<Socket>;
}

export default function Room({ roomId, socket }: Props) {

  const [players, setPlayers] = useState<string[]>([]);

  useEffect(() => {
    if (!socket.current) {
      return;
    }

    console.log('Sock: ', socket);

    socket.current.on('playerJoinedRoom', (player) => {
      console.log('Player: ', player);
    });

    socket.current.on('playersInRoom', (playerList) => {
      console.log('PIR: ', playerList);
      setPlayers(playerList);
    });
  }, [socket]);

  return (
    <div className="card lobby-card bg-green-200">
      <div className="room-created-h2">Share this code with your friends:</div>
      <div className="room-header">
        <p className="room-created-id">{roomId}</p>
      </div>

      <div className="player-list">
        <p>Players</p>
        <div className='flex flex-col'>
          {
            players.map((el, i) =>
              <div key={i}>{el}</div>
            )
          }
        </div>
      </div>

      <Button className='bg-red-500'>
         Leave Room
      </Button>

    </div>
  );
}