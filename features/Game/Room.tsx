import React, { useState, useEffect, useMemo } from 'react';
import Button from '../../core/components/Button';
import { FaCrown } from 'react-icons/fa';
import { IoDice } from 'react-icons/io5';
import Popup from 'reactjs-popup';
import { useAppSelector } from '../../store/hooks';
import { getGameStarted, getMatchWinner, getPlayerList } from '../../slices/game.slice';
import { useRouter } from 'next/navigation';
import { socket } from '../SocketClient';
import { ChoosePartnerInput } from '../../models/ChoosePartnerInput';
import { BasicRoomInput } from '../../models/BasicRoomInput';
import { IoExit, IoCheckmark, IoCopyOutline } from "react-icons/io5";

interface Props {
  roomId?: string;
}

export default function Room({ roomId }: Props) {

  const router = useRouter();

  // const [players, setPlayers] = useState<{ nickname: string, id: string }[]>([]);
  const [chooseModalOpen, setChooseModalOpen] = useState<boolean>(false);

  const players = useAppSelector(getPlayerList);
  const gameStarted = useAppSelector(getGameStarted);
  const matchWinner = useAppSelector(getMatchWinner);

  // Data to send to socket
  const socketData = useMemo(() => {
    // Get ID stored in local storage, otherwise set it
    let localId = typeof window !== 'undefined' ? localStorage.getItem("socketId") ?? undefined : undefined;

    if (!localId && socket?.id) {
      localStorage.setItem("socketId", socket.id);
      localId = socket.id
    }

    return ({
      roomId: roomId ? String(roomId) : undefined,
      localId: localId
    });
  }, [roomId]);

  function leaveRoom() {

    const data: BasicRoomInput = {
      ...socketData
    };

    socket.emit('leaveRoom', data);
  }

  function choosePartner(id: string) {

    const data: ChoosePartnerInput = {
      partnerId: String(id),
      ...socketData
    };

    socket.emit('setTeams', data);
  }

  function randomPartner() {
    const partnerIndex = Math.floor(Math.random() * 3) + 1;

    if (!players[partnerIndex]?.id) {
      return;
    }

    const data: ChoosePartnerInput = {
      partnerId: players[partnerIndex].id.toString(),
      ...socketData
    };

    socket.emit('setTeams', data);

  }

  useEffect(() => {

    if (players && players[0] && players[0].team && gameStarted && !matchWinner) {
      router.push(`/game?roomId=${String(roomId)}`);
    }

  }, [players, gameStarted, matchWinner]);

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="">Share this code with your friends:</div>
      <div className="">
        <p className="text-5xl font-semibold mt-2">{roomId}</p>
      </div>

      <div className='text-sky-500 hover:text-sky-400 cursor-pointer flex flex-row gap-2 items-center py-2'>
        <IoCopyOutline size={22} />
        Copy URL
      </div>

      <div className="mt-3">
        <div className='text-sm text-gray-500'>Players waiting in Lobby</div>
        <div className='flex flex-col rounded-lg border border-gray-400'>
          {
            players?.map((el, i) =>
              <div key={i} className={`text-center ${i == players.length - 1 ? '' : 'border-b border-gray-400'}`}>
                <div className='flex flex-row items-center justify-start pt-1'>
                  { i == 0 ?
                    <div className='left-2 w-3 relative' style={{ bottom: 2 }}>
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
        { players?.length > 0 && socketData.localId == players[0].id ?
          <Button className='green-button' disabled={players.length < 4} onClick={() => setChooseModalOpen(true)} icon={<IoCheckmark size={22} />}>
            Start Game
          </Button> : undefined
        }

        <Button className='red-button' onClick={leaveRoom} icon={<IoExit size={22} />}>
          Leave Room
        </Button>
      </div>


      <Popup contentStyle={{ left: '0%', width: '25em' }} open={chooseModalOpen} closeOnDocumentClick onClose={() => setChooseModalOpen(false)}>
        <div className="flex flex-col justify-center items-center mx-5">
          <div className="">Choose your partner</div>
          <div className='w-full'>
            {
              players?.map((el, i) => i != 0 ? <div key={'partner_' + i}>
                <Button className='white-button mt-5 w-full text-center' onClick={() => el.id ? choosePartner(el.id) : undefined}>
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