import React, { useState, useRef, useEffect } from 'react';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import Room from './Room';
import Button from '../../core/components/Button';
import Input from '../../core/components/Input';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { getErrorMsg, getJoinModalOpen, getMatchWinner, getPlayerList, getRoomId, getRoundWinners, setJoinModalOpen, setRoomId } from '../../slices/game.slice';
import MatchWinnersModal from './Modals/MatchWinnersModal';
import RoundWinnersModal from './Modals/RoundWinnersModal';
import { socket } from '../SocketClient';

export default function Lobby() {

  const dispatch = useAppDispatch();

  // Store room ID of game that player created
  const roomId = useAppSelector(getRoomId);

  // Store room ID of game that player created
  const [showNickWarning, setShowNickWarning] = useState(false);

  const [matchWinnerModalVisible, setMatchWinnerModalVisible] = useState<boolean>(false);
  const [roundWinnersModalVisible, setRoundWinnersModalVisible] = useState<boolean>(false);

  // React ref to access text field values
  const joinRoomRef = useRef<HTMLInputElement>(null);

  const [nickname, setNickname] = useState<string>();

  const errorMsg = useAppSelector(getErrorMsg);
  const joinModalOpen = useAppSelector(getJoinModalOpen);

  const matchWinner = useAppSelector(getMatchWinner);

  const players = useAppSelector(getPlayerList);

  const roundWinners = useAppSelector(getRoundWinners);

  const closeJoinModal = () => dispatch(setJoinModalOpen(false));

  function createRoomPressed() {
    if (!nickname) {
      setShowNickWarning(true);
    }
    else {
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

    const data = {
      nickname: String(nickname)
    };

    socket.emit('createRoom', data);
  }

  // Join a room
  function joinRoom() {
    const roomIdVal = joinRoomRef?.current?.value;
    const data = {
      roomId: String(roomIdVal),
      nickname: String(nickname)
    };

    socket.emit('joinRoom', data);
    // setInRoom(true);
    // setCreatedRoomId(String(roomIdVal));
    // setJoinOpen(false);
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

  function handleLeaveRoom() {
    dispatch(setRoomId(undefined));
  }


  useEffect(() => {
    if (!matchWinner) {
      return;
    }

    setMatchWinnerModalVisible(true);

  }, [matchWinner]);


  return (
    <div className='bg-slate-200 h-screen flex flex-col justify-center items-center'>
      <div className='bg-white rounded-lg border border-gray-400 p-10'>
        <div className='text-3xl mb-5 text-center'>Brawl Fours</div>
        {roomId ? (
          <Room roomId={roomId} onLeaveRoom={handleLeaveRoom}></Room>
        ) : (
          <div className="">
            <div className="">
              <Input
                placeholder="Enter nickname..."
                className='w-full'
                onChange={handleNickChange}
                defaultValue={nickname}
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

              <Popup open={joinModalOpen} closeOnDocumentClick onClose={closeJoinModal}>
                <div className="flex flex-col justify-center items-center">
                  <div className="">Enter room code:</div>
                  <Input
                    inputRef={joinRoomRef}
                    placeholder=""
                  />

                  { errorMsg ?
                    <div className='mt-5 text-red-500'>
                      {errorMsg}
                    </div>
                    : undefined
                  }

                  <Button className='blue-button mt-5' onClick={() => joinRoom()}>
                    Join Room
                  </Button>
                </div>
              </Popup>

            </div>

          </div>
        )}
      </div>

      <RoundWinnersModal isVisible={roundWinnersModalVisible} setIsVisible={setRoundWinnersModalVisible} players={players} roundWinners={roundWinners} />

      <MatchWinnersModal isVisible={matchWinnerModalVisible} setIsVisible={setMatchWinnerModalVisible} matchWinners={matchWinner} />
    </div>
  );
}