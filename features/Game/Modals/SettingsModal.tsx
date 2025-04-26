import React, { useEffect, useMemo, useState } from 'react';
import Modal from '../../../core/components/Modal';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { getSettingsModalVisible, setSettingsModalVisible } from '../../../slices/game.slice';
import Slider from '../../../core/components/Slider';
import Button from '../../../core/components/Button';
import { IoClose, IoSave } from 'react-icons/io5';
import Input from '../../../core/components/Input';
import { JoinRoomInput } from '../../../models/JoinRoomInput';
import { socket } from '../../SocketClient';

interface Props {
  roomId?: string;
  lobby?: boolean;
}

export default function SettingsModal({ roomId, lobby }: Props) {

  const dispatch = useAppDispatch();

  const [defaultNickname, setDefaultNickname] = useState<string>();
  const [nickname, setNickname] = useState<string>();

  const [defaultVolume, setDefaultVolume] = useState<number>();
  const [volume, setVolume] = useState<number>();

  const [showNickWarning, setShowNickWarning] = useState(false);

  const isVisible = useAppSelector(getSettingsModalVisible);

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

  function handleVolumeChange(val: number) {
    setVolume(val);
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

  function handleCancel() {
    dispatch(setSettingsModalVisible(false));
  }

  function handleSave() {
    localStorage.setItem('volume', String(volume ?? 50));
    setDefaultVolume(volume);

    if (nickname && nickname != defaultNickname) {
      localStorage.setItem('nickname', nickname);
      setDefaultNickname(nickname);

      if (roomId) {
        const data: JoinRoomInput = {
          ...socketData,
          nickname: nickname,
        };
        socket.emit('joinRoom', data);
      }

    }

    handleCancel();
  }

  useEffect(() => {
    // Get nickname stored in local storage
    const localNick = typeof window !== 'undefined' ? localStorage.getItem('nickname') ?? undefined : undefined;

    setDefaultNickname(localNick);

    // Get volume stored in local storage
    const localVolume = typeof window !== 'undefined' ? localStorage.getItem('volume') ?? undefined : undefined;

    setDefaultVolume(Number(localVolume));
  }, []);


  return (
    <Modal open={isVisible} closeOnDocumentClick={true} onClose={handleCancel} centered>
      <div className='flex flex-col items-center'>
        <div className='text-lg font-bold mb-5'>
          Settings
        </div>

        { !lobby ?
          <div className='grid grid-cols-3 gap-2 gap-y-5 items-end'>
            <div className='text-right pr-5 h-full flex items-center'>Nickname</div>
            <div className='col-span-2'>
              <Input
                placeholder="Enter nickname..."
                className='w-full'
                onChange={handleNickChange}
                defaultValue={defaultNickname}
                maxLength={15}
              />
              {showNickWarning ? (
                <div className="text-red-500 mt-1 text-sm">Must enter a nickname!</div>
              ) :
                (null)
              }
            </div>

            <div className='text-right pr-5'>Volume</div>
            <div className='col-span-2'>
              <Slider onChange={handleVolumeChange} defaultValue={defaultVolume} />
            </div>
          </div>
          :
          <div className='grid grid-cols-3 gap-2 gap-y-5 items-end'>
            <div className='text-right pr-5'>Volume</div>
            <div className='col-span-2'>
              <Slider onChange={handleVolumeChange} defaultValue={defaultVolume} />
            </div>
          </div>
        }

        <div className='flex flex-row gap-5 justify-center'>
          <Button className='green-button mt-5' onClick={handleSave} icon={<IoSave />}>
            Save
          </Button>

          <Button className='red-button mt-5' onClick={handleCancel} icon={<IoClose size={22}/>} iconClassName='mr-1'>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
