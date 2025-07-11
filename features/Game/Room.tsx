import React, { useState, useEffect, useMemo, useRef } from 'react';
import Button from '../../core/components/Button';
import { FaCrown, FaPencilAlt, FaRegTimesCircle } from 'react-icons/fa';
import { IoDice, IoEnter, IoPencil, IoSettings, IoListOutline, IoExit, IoCheckmark, IoCopyOutline, IoLink } from 'react-icons/io5';
import Popup from 'reactjs-popup';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { getErrorMsg, getGameIsTwo, getGameStarted, getJoinModalOpen, getMatchWinner, getMobileView, getPlayerList, getRoundWinners, setJoinModalOpen, setSettingsModalVisible } from '../../slices/game.slice';
import { useRouter } from 'next/navigation';
import { socket } from '../SocketClient';
import { ChoosePartnerInput } from '../../models/ChoosePartnerInput';
import { BasicRoomInput } from '../../models/BasicRoomInput';
import RoundWinnersModal from './Modals/RoundWinnersModal';
import MatchWinnersModal from './Modals/MatchWinnersModal';
import { JoinRoomInput } from '../../models/JoinRoomInput';
import Input from '../../core/components/Input';
import { Tooltip, TooltipRefProps } from 'react-tooltip';
import { PlayerSocket } from '../../models/PlayerSocket';
import { KickPlayerInput } from '../../models/KickPlayerInput';
import Chatbox from './Chatbox';
import Popconfirm from '../../core/components/Popconfirm';
import LoadingIcon from './LoadingIcon';
import Checkbox from '../../core/components/Checkbox';
import { SetGameIsTwoInput } from '../../models/SetGameIsTwoInput';
import SettingsModal from './Modals/SettingsModal';
import Image from 'next/image';
import logoSvg from '../../public/images/logo/logo.svg';

interface Props {
  roomId?: string;
}

export default function Room({ roomId }: Props) {

  const router = useRouter();
  const dispatch = useAppDispatch();

  const settingsTooltipRef = useRef<TooltipRefProps>(null);

  const mobileView = useAppSelector(getMobileView);

  const [chooseModalOpen, setChooseModalOpen] = useState<boolean>(false);

  const [matchWinnerModalVisible, setMatchWinnerModalVisible] = useState<boolean>(false);
  const [roundWinnersModalVisible, setRoundWinnersModalVisible] = useState<boolean>(false);
  const [isChangingNickname, setIsChangingNickname] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const joinModalOpen = useAppSelector(getJoinModalOpen);

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
  const gameIsTwo = useAppSelector(getGameIsTwo);

  // Data to send to socket
  const socketData = useMemo(() => {
    // Get ID stored in local storage, otherwise set it
    let localId = typeof window !== 'undefined' ? localStorage.getItem('socketId') ?? undefined : undefined;

    if (!localId && socket?.id) {
      localStorage.setItem('socketId', socket.id);
      localId = socket.id;
    }

    return ({
      roomId: roomId ? String(roomId) : undefined,
      localId: localId
    });
  }, [roomId]);

  const isRoomOwner = useMemo(() => {
    return players && players[0] && players[0].id == socketData?.localId;
  }, [players, socketData]);

  function joinRoom(nick?: string) {
    // Get ID stored in local storage, otherwise set it
    let localId = typeof window !== 'undefined' ? localStorage.getItem('socketId') ?? undefined : undefined;

    if (!localId && socket?.id) {
      localStorage.setItem('socketId', socket.id);
      localId = socket.id;
    }

    localStorage.setItem('nickname', nick ?? String(nickname));

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

  function setGameIsTwo(checked?: boolean) {
    const data: SetGameIsTwoInput = {
      ...socketData,
      gameIsTwo: checked
    };

    socket.emit('setGameIsTwo', data);
  }

  function choosePartner(id: string) {
    setIsLoading(true);

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

  function changeName() {
    setIsChangingNickname(true);
    dispatch(setJoinModalOpen(true));
  }

  function kickPlayer(player: PlayerSocket) {
    const data: KickPlayerInput = {
      ...socketData,
      kickedPlayerSocketId: player.socketId,
      kickedPlayerNickname: player.nickname
    };

    socket.emit('kickPlayer', data);
  }

  function closeJoinModal() {
    setIsChangingNickname(false);
    dispatch(setJoinModalOpen(false));
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
    const localNick = typeof window !== 'undefined' ? localStorage.getItem('nickname') ?? undefined : undefined;

    if (localNick) {
      setNickname(localNick);
      joinRoom(localNick);
    }
    else {
      dispatch(setJoinModalOpen(true));
    }
  }, []);

  useEffect(() => {
    return () => {
      setIsLoading(false);
    };
  }, []);


  return (
    <div className='h-[100dvh] w-screen lobby-bg'>
      <SettingsModal roomId={roomId} lobby settingsTooltipRef={settingsTooltipRef} />

      <div className={`flex flex-row justify-between items-center w-full gap-2 pl-3 py-3 ${mobileView ? '' : 'absolute'}`}>
        { mobileView ?
          <div>
            <Image priority
              src={logoSvg}
              width={300}
              alt="" />
          </div>
          :
          <div>
          </div>
        }

        <div className='flex flex-row gap-2 px-2'>
          <Button
            className='dark-button'
            iconClassName='relative'
            icon={<IoListOutline size={20} />}
            tooltip='Help'
            tooltipAnchor='help'
            tooltipPlacement='bottom'
            onClick={() => dispatch(setSettingsModalVisible(true))}
          />

          <Button
            className='dark-button'
            iconClassName='relative'
            icon={<IoSettings size={20} />}
            tooltip='Settings'
            tooltipAnchor='settings'
            tooltipPlacement='bottom'
            externalTooltipRef={settingsTooltipRef}
            onClick={() => dispatch(setSettingsModalVisible(true))}
          />
        </div>
      </div>

      <div className={`flex flex-row ${mobileView ? 'h-[90%]' : ''}`}>

        { mobileView ? <></>
          :
          <div className='h-[100dvh] flex items-center mx-3 w-1/4 min-w-[280px] py-3'>
            <Chatbox socketData={socketData} hideTeam className='h-[95dvh]' />
          </div>
        }

        <div className={`w-screen flex flex-col items-center ${mobileView ? 'justify-start' : 'justify-center h-[100dvh]'}`}>

          <div className={mobileView ? 'hidden' : 'relative bottom-10 mx-5'}>
            <Image priority
              src={logoSvg}
              width={800}
              alt="" />
          </div>

          <div className='bg-white rounded-lg border border-gray-400 p-10 mx-5'>
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
                { !players || players.length == 0 ?
                  <LoadingIcon />
                  :
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
                            <div className='flex flex-row justify-between items-center w-full'>
                              <div className={`mx-5 ${el?.id == socketData?.localId ? 'font-bold' : ''}`}>{el.nickname}</div>
                              {el?.id == socketData?.localId ?
                                <div className='right-3 w-3 relative text-blue-500 hover:text-blue-400' style={{ bottom: 2 }}>
                                  <FaPencilAlt className='cursor-pointer' onClick={changeName} />
                                </div>
                                : isRoomOwner ?
                                  <Popconfirm shortcode={`kick-${i}`} message='Are you sure you want to kick this player?' onConfirm={() => kickPlayer(el)}>
                                    <button className={`right-3 w-3 relative text-red-500 hover:text-red-400 kick-${i}`} style={{ top: 2 }}>
                                      <FaRegTimesCircle className='cursor-pointer' />
                                    </button>
                                  </Popconfirm> :<div className='w-3'></div>
                              }
                            </div>
                          </div>
                        </div>
                      )
                    }
                  </div>
                }
              </div>

              {!players || players.length == 0 ?
                <></> :
                <div className='mt-3'>
                  <Checkbox defaultChecked={gameIsTwo} label='Game is two' onChange={(val) => setGameIsTwo(val)} disabled={!isRoomOwner}/>
                </div>
              }

              <div className={`flex ${mobileView ? 'flex-col gap-2' : 'flex-row gap-5'} mt-3`}>
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
                  {
                    isLoading ?
                      <LoadingIcon />
                      :
                      <>
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
                      </>
                  }
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

                  { isChangingNickname ?
                    <Button className='blue-button mt-5' onClick={() => joinRoom()} icon={<IoPencil size={22} />}>
                      Change Name
                    </Button>
                    :
                    <Button className='blue-button mt-5' onClick={() => joinRoom()} icon={<IoEnter size={22} />}>
                      Join Room
                    </Button>
                  }
                </div>
              </Popup>

              <Tooltip
                anchorSelect={'.copy-icon'}
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

          { mobileView ?
            <div className='h-full w-full px-5 mt-3'>
              <Chatbox socketData={socketData} hideTeam />
            </div>
            : <></>
          }

        </div>
      </div>

    </div>
  );
}