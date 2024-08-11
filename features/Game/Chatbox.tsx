import React, { useRef } from 'react'
import Input from '../../core/components/Input'
import { socket } from '../SocketClient';
import { BasicRoomInput } from '../../models/BasicRoomInput';
import { useAppSelector } from '../../store/hooks';
import { getChatMessages, getChatMode } from '../../slices/chat.slice';
import ChatInput from '../../core/components/ChatInput';

interface Props {
  socketData?: BasicRoomInput;
}

export default function Chatbox({ socketData }: Props) {

  const chatInputRef = useRef<HTMLInputElement>(null);

  const chatMessages = useAppSelector(getChatMessages);

  const chatMode = useAppSelector(getChatMode);

  function handleChatSend() {
    const message = chatInputRef?.current?.value;

    // If message is too long, do not send it to the server
    if (message.length > 50) {
      return;
    }

    chatInputRef.current.value = '';

    socket.emit('chat', { ...socketData, message: message, mode: chatMode });
  }



  return (
    <div className='h-[68vh] flex flex-col justify-between w-full'>
      <div className='flex flex-col gap-2 h-[58vh] w-full overflow-y-scroll pr-1'>
        {chatMessages?.map(msg => <div className='flex-none text-balance whitespace-normal break-words'>
          { msg.mode ?
            <span className='mr-1' style={{ color: msg.modeColour }}>
              {
                "[" + msg.mode?.toUpperCase() + "]"
              }
            </span>
            : undefined
          }

          <span className='mr-2' style={{ color: msg.senderColour }}>
            {msg.sender}
            <span color='black'>{msg.mode == 'log' ? '' : ':'}</span>
          </span >

          <span style={{ color: msg.messageColour }}>
            {msg.message}
          </span >
        </div>)}
      </div>

      <div className=''>
        <ChatInput
          inputRef={chatInputRef}
          placeholder=""
          className='w-full'
          onSend={handleChatSend}
          charLimit={50}
        />

      </div>
    </div>
  )
}
