import React, { useRef } from 'react'
import Input from '../../core/components/Input'
import { socket } from '../SocketClient';
import { BasicRoomInput } from '../../models/BasicRoomInput';
import { useAppSelector } from '../../store/hooks';
import { getChatMessages } from '../../slices/game.slice';

interface Props {
  socketData?: BasicRoomInput;
}

export default function Chatbox({ socketData }: Props) {

  const chatInputRef = useRef<HTMLInputElement>(null);

  const chatMessages = useAppSelector(getChatMessages);

  function handleChatSend() {
    const message = chatInputRef?.current?.value;

    console.log(message);

    chatInputRef.current.value = '';

    socket.emit('chat', { ...socketData, message: message });

  }

  return (
    <div className='h-[68vh] flex flex-col justify-between w-full'>
      <div className='flex flex-col gap-2 h-[58vh] overflow-y-scroll'>
        {chatMessages?.map(msg => <div className='flex-none'>
          <span className='mr-2' style={{ color: msg.senderColour }}>
            {msg.sender}
            <span color='black'>{msg.isSystemMessage ? '' : ':'}</span>
          </span >

          <span style={{ color: msg.messageColour }}>
            {msg.message}
          </span >
        </div>)}
      </div>

      <div className=''>
        <Input
          inputRef={chatInputRef}
          placeholder=""
          className='w-full'
          hasSendButton
          onSend={handleChatSend}
          charLimit={50}
        />

      </div>
    </div>
  )
}
