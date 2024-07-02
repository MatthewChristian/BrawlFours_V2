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

    socket.current.on('playerJoinedRoom', (player) => {
      console.log('Player: ', player);
    });

    socket.current.on('playersInRoom', (playerList) => {
      setPlayers(playerList);
    });
  }, [socket]);

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="">Share this code with your friends:</div>
      <div className="">
        <p className="text-5xl font-semibold mt-2">{roomId}</p>
      </div>

      <div className="mt-3">
        <div className='text-sm text-gray-500'>Players waiting in Lobby</div>
        <div className='flex flex-col rounded-lg border border-gray-400'>
          {
            players.map((el, i) =>
              <div key={i} className={`text-center ${i == players.length - 1 ? '' : 'border-b border-gray-400'}`}>{el}</div>
            )
          }
        </div>
      </div>

      <div className='flex flex-row gap-5 mt-5'>
        <Button className='green-button'>
        Start Game
        </Button>

        <Button className='red-button'>
         Leave Room
        </Button>
      </div>

    </div>
  );
}