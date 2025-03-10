import React, { useState, useEffect, useMemo } from 'react';
import Button from '../../core/components/Button';
import { FaCrown } from 'react-icons/fa';
import { IoDice, IoEnter } from 'react-icons/io5';
import Popup from 'reactjs-popup';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { getErrorMsg, getGameStarted, getJoinModalOpen, getMatchWinner, getPlayerList, getRoundWinners, setJoinModalOpen } from '../../slices/game.slice';
import { useRouter } from 'next/navigation';
import { socket } from '../SocketClient';
import { ChoosePartnerInput } from '../../models/ChoosePartnerInput';
import { BasicRoomInput } from '../../models/BasicRoomInput';
import { IoExit, IoCheckmark, IoCopyOutline, IoLink } from "react-icons/io5";
import RoundWinnersModal from './Modals/RoundWinnersModal';
import MatchWinnersModal from './Modals/MatchWinnersModal';
import { JoinRoomInput } from '../../models/JoinRoomInput';
import Input from '../../core/components/Input';
import { Tooltip } from 'react-tooltip';

interface Props {
  roomId?: string;
}

export default function Room({ roomId }: Props) {

  const router = useRouter();
  const dispatch = useAppDispatch();

  const [chooseModalOpen, setChooseModalOpen] = useState<boolean>(false);

  const [matchWinnerModalVisible, setMatchWinnerModalVisible] = useState<boolean>(false);
  const [roundWinnersModalVisible, setRoundWinnersModalVisible] = useState<boolean>(false);

  const joinModalOpen = useAppSelector(getJoinModalOpen);

  const closeJoinModal = () => dispatch(setJoinModalOpen(false));

  // Store room ID of game that player created
  const [showNickWarning, setShowNickWarning] = useState(false);

  const [nickname, setNickname] = useState<string>();

  const errorMsg = useAppSelector(getErrorMsg);

  const [urlCopied, setUrlCopied] = useState<boolean>(false);
  const [codeCopied, setCodeCopied] = useState<boolean>(false);

  const players = useAppSelector(getPlayerList);
  const gameStarted = useAppSelector(getGameStarted);
  const matchWinner = useAppSelector(getMatchWinner);
  const roundWinners = useAppSelector(getRoundWinners);

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

  function joinRoom(nick?: string) {
    // Get ID stored in local storage, otherwise set it
    let localId = typeof window !== 'undefined' ? localStorage.getItem("socketId") ?? undefined : undefined;

    if (!localId && socket?.id) {
      localStorage.setItem("socketId", socket.id);
      localId = socket.id
    }

    localStorage.setItem("nickname", nick ?? String(nickname));

    const data: JoinRoomInput = {
      roomId: String(roomId),
      nickname: nick ?? String(nickname),
      localId: localId
    };

    socket.emit('joinRoom', data);

  }

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

  function handleNickChange(val: string) {
    setNickname(val);

    if (!val) {
      setShowNickWarning(true);
    }
    else {
      setShowNickWarning(false);
    }
  }

  async function copyUrl() {

    navigator.clipboard.writeText(window.location.href);

    if (urlCopied) {
      return;
    }
    setUrlCopied(true);
    setTimeout(() => {
      setUrlCopied(false);
    }, 2000);
  }

  async function copyCode() {

    navigator.clipboard.writeText(roomId);
    if (codeCopied) {
      return;
    }
    setCodeCopied(true);
    setTimeout(() => {
      setCodeCopied(false);
    }, 2000);
  }

  useEffect(() => {

    if (players && players[0] && players[0].team && gameStarted && !matchWinner) {
      router.push(`/game?roomId=${String(roomId)}`);
    }

  }, [players, gameStarted, matchWinner]);

  useEffect(() => {
    if (!matchWinner) {
      return;
    }

    setMatchWinnerModalVisible(true);

  }, [matchWinner]);

  useEffect(() => {
    // Get nickname stored in local storage, otherwise set it
    let localNick = typeof window !== 'undefined' ? localStorage.getItem("nickname") ?? undefined : undefined;

    if (localNick) {
      setNickname(localNick);
      joinRoom(localNick);
    }
    else {
      dispatch(setJoinModalOpen(true));
    }
  }, []);


  return (
    <div className='bg-slate-200 h-screen flex flex-col justify-center items-center'>
      <div className='bg-white rounded-lg border border-gray-400 p-10'>
        <div className='text-3xl mb-5 text-center'>Brawl Fours</div>
          <div className="flex flex-col justify-center items-center">

            <div className="">Share this code with your friends:</div>

            <div className='flex flex-row items-center gap-2'>
              <p className="text-5xl font-semibold mt-2">{roomId}</p>
              <button className='text-sky-500 hover:text-sky-400 cursor-pointer copy-icon' onClick={copyCode}>
                <IoCopyOutline size={32} />
              </button>
            </div>

            <button className='text-sky-500 hover:text-sky-400 cursor-pointer flex flex-row gap-2 items-center py-1' onClick={copyUrl}>
              <IoLink size={22} />
              {
                urlCopied ?
                  <div>Link Copied!</div> :
                  <div>Copy Link</div>
              }
            </button>

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

            <RoundWinnersModal isVisible={roundWinnersModalVisible} setIsVisible={setRoundWinnersModalVisible} players={players} roundWinners={roundWinners} />

            <MatchWinnersModal isVisible={matchWinnerModalVisible} setIsVisible={setMatchWinnerModalVisible} matchWinners={matchWinner} />

            <Popup contentStyle={{ left: '0%', width: '25em'}} open={joinModalOpen} closeOnDocumentClick onClose={closeJoinModal}>
              <div className="flex flex-col justify-center items-center">
                <div className="">Enter nickname:</div>
                  <Input
                    placeholder="Enter nickname..."
                    onChange={handleNickChange}
                    defaultValue={nickname}
                    maxLength={15}
                  />
                  {showNickWarning ? (
                    <div className="text-red-500 mt-1">Must enter a nickname first!</div>
                  ) :
                    (null)
                  }

                  { errorMsg ?
                    <div className='mt-5 text-red-500'>
                      {errorMsg}
                    </div>
                    : undefined
                  }

                <Button className='blue-button mt-5' onClick={() => joinRoom()} icon={<IoEnter size={22} />}>
                  Join Room
                </Button>
              </div>
            </Popup>

            <Tooltip
              anchorSelect={`.copy-icon`}
              place="top"
              noArrow
              isOpen={codeCopied}
              className='copy-tooltip'
              opacity={1}
            >
              <div>Room Code Copied!</div>
            </Tooltip>
        </div>
      </div>
    </div>
  );
}