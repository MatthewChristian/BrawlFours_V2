import React, { useState, useRef, useEffect } from 'react';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import Button from '../../core/components/Button';
import Input from '../../core/components/Input';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { getErrorMsg, getJoinModalOpen, getRoomId, setJoinModalOpen, setSettingsModalVisible } from '../../slices/game.slice';
import { socket } from '../SocketClient';
import { CreateRoomInput } from '../../models/CreateRoomInput';
import { JoinRoomInput } from '../../models/JoinRoomInput';
import { IoAdd, IoEnter, IoSettings } from 'react-icons/io5';
import { useRouter } from 'next/navigation';
import LoadingIcon from './LoadingIcon';
import SettingsModal from './Modals/SettingsModal';

export default function Lobby() {

  const dispatch = useAppDispatch();

  const router = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(false);

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
      setIsLoading(true);
      createRoom();
    }
  }

  function joinRoomPressed() {
    if (!nickname) {
      setShowNickWarning(true);
    }
    else {
      setIsLoading(true);
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
      setIsLoading(false);
      router.push(`/room?roomId=${String(roomId)}`);
    }
  }, [roomId]);

  return (
    <div className='lobby-bg h-screen flex flex-col justify-center items-center'>
      <SettingsModal lobby />

      <div className='flex flex-row gap-2 absolute top-3 right-3'>
        <Button
          className='dark-button'
          iconClassName='relative '
          icon={<IoSettings size={20} />}
          tooltip='Settings'
          tooltipAnchor='settings'
          onClick={() => dispatch(setSettingsModalVisible(true))}
        />
      </div>

      <div className='bg-white rounded-lg border border-gray-400 p-10'>
        <div className='text-3xl mb-5 text-center'>Brawl Fours</div>

        <div className="">
          <div className="">
            <Input
              placeholder="Enter nickname..."
              className='w-full'
              onChange={handleNickChange}
              defaultValue={nickname}
              maxLength={15}
            />
            {showNickWarning ? (
              <div className="text-red-500 mt-1">Must enter a nickname first!</div>
            ) :
              (null)
            }

            { isLoading ?
              <div className='flex flex-row justify-center items-center mt-3'>
                <LoadingIcon />
              </div>
              :
              <div className='flex flex-row gap-5 mt-5'>
                <Button className='blue-button' onClick={() => joinRoomPressed()} icon={<IoEnter size={22} />}>
                Join Room
                </Button>

                <Button className="green-button" onClick={() => createRoomPressed()} icon={<IoAdd size={22} />}>
                Create Room
                </Button>
              </div>
            }

            <Popup contentStyle={{ left: '0%', width: '25em'}} open={joinModalOpen} closeOnDocumentClick onClose={closeJoinModal}>
              <div className="flex flex-col justify-center items-center">
                <div className="">Enter room code:</div>
                <Input
                  inputRef={joinRoomRef}
                  placeholder=""
                  maxLength={5}
                  className='text-center'
                />

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

          </div>

        </div>

      </div>


    </div>
  );
}