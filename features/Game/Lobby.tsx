import React, { useState, useRef, useEffect } from 'react';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import Button from '../../core/components/Button';
import Input from '../../core/components/Input';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { getErrorMsg, getJoinModalOpen, getJoinRoomLoading, getMobileView, getRoomId, setJoinModalOpen, setJoinRoomLoading, setSettingsModalVisible } from '../../slices/game.slice';
import { socket } from '../SocketClient';
import { CreateRoomInput } from '../../models/CreateRoomInput';
import { JoinRoomInput } from '../../models/JoinRoomInput';
import { IoAdd, IoEnter, IoSettings } from 'react-icons/io5';
import { useRouter } from 'next/navigation';
import LoadingIcon from './LoadingIcon';
import SettingsModal from './Modals/SettingsModal';
import Image from 'next/image';
import logoSvg from '../../public/images/logo/logo.svg';
import { TooltipRefProps } from 'react-tooltip';

export default function Lobby() {

  const dispatch = useAppDispatch();

  const settingsTooltipRef = useRef<TooltipRefProps>(null);

  const router = useRouter();

  const mobileView = useAppSelector(getMobileView);

  const joinRoomLoading = useAppSelector(getJoinRoomLoading);

  // Store room ID of game that player created
  const roomId = useAppSelector(getRoomId);

  const [showNickWarning, setShowNickWarning] = useState(false);

  // React ref to access text field values
  const joinRoomRef = useRef<HTMLInputElement>(null);

  const [nickname, setNickname] = useState<string>();

  const errorMsg = useAppSelector(getErrorMsg);
  const joinModalOpen = useAppSelector(getJoinModalOpen);



  const closeJoinModal = () => dispatch(setJoinModalOpen(false));

  function createRoomPressed() {
    if (!nickname) {
      setShowNickWarning(true);
    }
    else {
      dispatch(setJoinRoomLoading(true));
      createRoom();
    }
  }

  function joinRoomPressed() {
    if (!nickname) {
      setShowNickWarning(true);
    }
    else {
      dispatch(setJoinModalOpen(true));
    }
  }

  // Create a room
  function createRoom() {

    // Get ID stored in local storage, otherwise set it
    let localId = typeof window !== 'undefined' ? localStorage.getItem('socketId') ?? undefined : undefined;

    if (!localId && socket?.id) {
      localStorage.setItem('socketId', socket.id);
      localId = socket.id;
    }

    localStorage.setItem('nickname', String(nickname));

    const data: CreateRoomInput = {
      nickname: String(nickname),
      localId: localId
    };

    socket.emit('createRoom', data);
  }

  // Join a room
  function joinRoom() {
    dispatch(setJoinRoomLoading(true));
    // Get ID stored in local storage, otherwise set it
    let localId = typeof window !== 'undefined' ? localStorage.getItem('socketId') ?? undefined : undefined;

    if (!localId && socket?.id) {
      localStorage.setItem('socketId', socket.id);
      localId = socket.id;
    }

    localStorage.setItem('nickname', String(nickname));

    const roomIdVal = joinRoomRef?.current?.value;
    const data: JoinRoomInput = {
      roomId: String(roomIdVal),
      nickname: String(nickname),
      localId: localId
    };

    socket.emit('joinRoom', data);

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

  useEffect(() => {
    // Get nickname stored in local storage, otherwise set it
    const localNick = typeof window !== 'undefined' ? localStorage.getItem('nickname') ?? undefined : undefined;

    setNickname(localNick);
  }, []);

  useEffect(() => {
    if (roomId) {
      router.push(`/room?roomId=${String(roomId)}`);
    }
  }, [roomId]);

  return (
    <div className='lobby-bg h-screen flex flex-col justify-center items-center'>
      <SettingsModal lobby settingsTooltipRef={settingsTooltipRef} />

      <div className='flex flex-row gap-2 absolute top-3 right-3'>
        <Button
          className='dark-button'
          iconClassName='relative '
          icon={<IoSettings size={20} />}
          tooltip='Settings'
          tooltipAnchor='settings'
          tooltipPlacement='bottom'
          externalTooltipRef={settingsTooltipRef}
          onClick={() => dispatch(setSettingsModalVisible(true))}
        />
      </div>

      <div className='flex flex-col justify-between gap-12 items-center'>
        <div className='px-5'>
          <Image priority
            src={logoSvg}
            width={800}
            alt="" />
        </div>

        <div className={`bg-white rounded-lg border border-gray-400 p-10 ${mobileView ? 'w-3/4' : 'w-1/2'}`}>
          <div className="">
            <div className="flex flex-col items-center">
              <div>
                <Input
                  placeholder="Enter nickname..."
                  className='w-full text-center'
                  onChange={handleNickChange}
                  defaultValue={nickname}
                  maxLength={15}
                />
                {showNickWarning ? (
                  <div className="text-red-500 mt-1">Must enter a nickname first!</div>
                ) :
                  (null)
                }
              </div>

              <div>
                { joinRoomLoading ?
                  <div className='flex flex-row justify-center items-center mt-3'>
                    <LoadingIcon />
                  </div>
                  :
                  <div className={`flex ${mobileView ? 'flex-col' : 'flex-row'} gap-5 mt-5`}>
                    <Button className='blue-button' onClick={() => joinRoomPressed()} icon={<IoEnter size={22} />}>
                      Join Room
                    </Button>

                    <Button className="green-button" onClick={() => createRoomPressed()} icon={<IoAdd size={22} />}>
                      Create Room
                    </Button>
                  </div>
                }
              </div>

            </div>

          </div>

        </div>
      </div>

      <Popup contentStyle={{ left: '0%', width: '25em' }} open={joinModalOpen} closeOnDocumentClick onClose={closeJoinModal}>
        <div className="flex flex-col justify-center items-center">
          <div className="">Enter room code:</div>
          <Input
            inputRef={joinRoomRef}
            placeholder=""
            maxLength={5}
            className='text-center'
          />

          {errorMsg ?
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

    </div>
  );
}