import React, { useState, useEffect, RefObject } from 'react';
import { Socket } from 'socket.io-client';
import Button from '../../core/components/Button';

interface Props {
  roomId?: string;
  socket: RefObject<Socket>;
  onLeaveRoom: () => void;
}

export default function Room({ roomId, socket, onLeaveRoom}: Props) {

  const [players, setPlayers] = useState<{ nickname: string, id: string }[]>([]);

  function leaveRoom() {

    const data = {
      roomId: String(roomId),
    };

    socket.current?.emit('leaveRoom', data);
    onLeaveRoom();
  }

  useEffect(() => {
    if (!socket.current) {
      return;
    }

    socket.current.on('playerJoinedRoom', (player) => {
      console.log('Player: ', player);
    });

    socket.current.on('playersInRoom', (playerList) => {
      console.log('PL: ', playerList);
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
              <div key={i} className={`text-center ${i == players.length - 1 ? '' : 'border-b border-gray-400'}`}>{el.nickname}</div>
            )
          }
        </div>
      </div>

      <div className='flex flex-row gap-5 mt-5'>
        <Button className='green-button'>
          Start Game
        </Button>

        <Button className='red-button' onClick={leaveRoom}>
          Leave Room
        </Button>
      </div>

    </div>
  );
}