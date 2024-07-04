import React, { useState, useEffect, RefObject } from 'react';
import { Socket } from 'socket.io-client';
import Button from '../../core/components/Button';
import { FaCrown } from 'react-icons/fa';
import { IoDice } from 'react-icons/io5';

import Popup from 'reactjs-popup';
import { useRouter } from 'next/router';

interface Props {
  roomId?: string;
  socket: RefObject<Socket>;
  onLeaveRoom: () => void;
}

export default function Room({ roomId, socket, onLeaveRoom}: Props) {

  const router = useRouter();

  const [players, setPlayers] = useState<{ nickname: string, id: string }[]>([]);
  const [chooseModalOpen, setChooseModalOpen] = useState<boolean>(false);

  function leaveRoom() {

    const data = {
      roomId: String(roomId),
    };

    socket.current?.emit('leaveRoom', data);
    onLeaveRoom();
  }

  function choosePartner(id: string) {

    const data = {
      roomId: String(roomId),
      partnerId: String(id)
    };

    socket.current?.emit('setTeams', data);
  }

  function randomPartner() {
    const partnerIndex = Math.floor(Math.random() * 3) + 1;

    const data = {
      roomId: String(roomId),
      partnerId: players[partnerIndex].id.toString()
    };

    socket.current?.emit('setTeams', data);

  }

  useEffect(() => {
    console.log('UE: ', {...socket});
    if (!socket.current) {
      return;
    }


    socket.current.on('playersInRoom', (playerList) => {

      console.log('PL: ', playerList);

      setPlayers(playerList);

      if (playerList && playerList[0] && playerList[0].team) {
        router.push({
          pathname: '/game',
          query: {
            roomId: String(roomId)
          }
        });
      }
    });
  }, [socket, roomId]);

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
              <div key={i} className={`text-center ${i == players.length - 1 ? '' : 'border-b border-gray-400'}`}>
                <div className='flex flex-row items-center justify-start pt-1'>
                  { i == 0 ?
                    <div className='px-2 w-3 relative' style={{ bottom: 2 }}>
                      <FaCrown color='#facc15'/>
                    </div>
                    : <div className='w-3'></div>
                  }
                  <div className='mx-5'>{el.nickname}</div>
                </div>
              </div>
            )
          }
        </div>
      </div>

      <div className='flex flex-row gap-5 mt-5'>
        { players.length > 0 && socket.current.id == players[0].id ?
          <Button className='green-button' disabled={players.length < 4} onClick={() => setChooseModalOpen(true)}>
            Start Game
          </Button> : undefined
        }

        <Button className='red-button' onClick={leaveRoom}>
          Leave Room
        </Button>
      </div>


      <Popup open={chooseModalOpen} closeOnDocumentClick onClose={() => setChooseModalOpen(false)}>
        <div className="flex flex-col justify-center items-center mx-5">
          <div className="">Choose your partner</div>
          <div className='w-full'>
            {
              players.map((el, i) => i != 0 ? <div key={'partner_' + i}>
                <Button className='white-button mt-5 w-full text-center' onClick={() => choosePartner(el.id)}>
                  {el.nickname}
                </Button>
              </div> : undefined
              )}
          </div>

          <Button className='blue-button mt-5' icon={<IoDice size={24} />} onClick={() => randomPartner()}>
            Randomise Teams
          </Button>
        </div>
      </Popup>

    </div>
  );
}