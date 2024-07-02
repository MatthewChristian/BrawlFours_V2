import React, { useState, useEffect, useRef, RefObject } from 'react';
import io, { Socket } from 'socket.io-client';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import Room from './Room';
import { useRouter } from 'next/router';
import Button from '../../core/components/Button';
import Input from '../../core/components/Input';

interface Props {
    roomId?: string;
    socket: RefObject<Socket>;
}

export default function Lobby({ roomId, socket }: Props) {

  const router = useRouter();

  // Indicate if the game has been initialised as yet
  const [loaded, setLoaded] = useState<boolean>(false);

  // Indicate if user is in a room waiting
  const [inRoom, setInRoom] = useState(false);

  // Store room ID of game that player created
  const [createdRoomId, setCreatedRoomId] = useState('');

  // Store room ID of game that player created
  const [showNickWarning, setShowNickWarning] = useState(false);

  // Used to open and close modal form
  const [createdOpen, setCreatedOpen] = useState(false);
  const closeCreatedModal = () => setCreatedOpen(false);

  const [joinOpen, setJoinOpen] = useState(false);
  const closeJoinModal = () => setJoinOpen(false);

  // React ref to access text field values
  const joinRoomRef = useRef<HTMLInputElement>(null);
  const joinNickRef = useRef<HTMLInputElement>(null);

  function createRoomPressed() {
    const nickVal = joinNickRef.current?.value;
    if (!nickVal) {
      setShowNickWarning(true);
    }
    else {
      createRoom();
      setInRoom(true);
      setCreatedOpen(true);
    }
  }

  function joinRoomPressed() {
    const nickVal = joinNickRef.current?.value;

    if (!nickVal) {
      setShowNickWarning(true);
    }
    else {
      setJoinOpen(true);
    }
  }

  // Create a room
  function createRoom() {

    const nickVal = joinNickRef.current?.value;

    const data = {
      nickname: String(nickVal)
    };

    socket.current?.emit('createRoom', data);
  }

  // Join a room
  function joinRoom() {
    const roomIdVal = joinRoomRef.current?.value;
    const nickVal = joinNickRef.current?.value;
    const data = {
      roomId: String(roomIdVal),
      nickname: String(nickVal)
    };

    socket.current?.emit('joinRoom', data);
    setInRoom(true);
    setCreatedRoomId(String(roomIdVal));
  }

  function handleNickChange(val: string) {
    if (!val) {
      setShowNickWarning(true);
    }
    else {
      setShowNickWarning(false);
    }
  }

  useEffect(() => {
    socket.current?.on('newRoomCreated', data => {
      setCreatedRoomId(data.roomId);
    });
  }, [socket]);

  return (
    <div className='bg-slate-200 h-screen flex flex-col justify-center items-center'>
      <div className='bg-white rounded-lg border border-gray-400 p-10'>
        <div className='text-3xl mb-5 text-center'>Brawl Fours</div>
        {inRoom ? (
          <Room roomId={createdRoomId} socket={socket}></Room>
        ) : (
          <div className="">
            <div className="">

              <Input
                inputRef={joinNickRef}
                placeholder="Enter nickname..."
                className='w-full'
                onChange={handleNickChange}
              />
              {showNickWarning ? (
                <div className="text-red-500 mt-1">Must enter a nickname first!</div>
              ) :
                (null)
              }

              <div className='flex flex-row gap-5 mt-5'>
                <Button className='blue-button' onClick={() => joinRoomPressed()}>
                Join Room
                </Button>

                <Button className="green-button" onClick={() => createRoomPressed()}>
                Create Room
                </Button>
              </div>

              <Popup open={joinOpen} closeOnDocumentClick onClose={closeJoinModal}>
                <div className="flex flex-col justify-center items-center">
                  <div className="">Enter room code:</div>
                  <Input
                    inputRef={joinRoomRef}
                    placeholder=""
                  />

                  <Button className='blue-button mt-5' onClick={() => joinRoom()}>
                    Join Room
                  </Button>
                </div>
              </Popup>

            </div>

          </div>
        )}
      </div>
    </div>
  );
}