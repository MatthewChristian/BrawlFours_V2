import React, { useEffect, useRef, useState } from 'react';
import { socket } from '../SocketClient';
import { BasicRoomInput } from '../../models/BasicRoomInput';
import { useAppSelector } from '../../store/hooks';
import { getChatMessages, getChatMode } from '../../slices/chat.slice';
import ChatInput from '../../core/components/ChatInput';

interface Props {
  socketData?: BasicRoomInput;
  className?: string
  hideTeam?: boolean;
}

export default function Chatbox({ socketData, className, hideTeam }: Props) {

  const chatInputRef = useRef<HTMLInputElement>(null);
  const chatBoxRef = useRef<HTMLInputElement>(null);

  const chatMessages = useAppSelector(getChatMessages);

  const [prevScrollHeight, setPrevScrollHeight] = useState<number>(0);

  const chatMode = useAppSelector(getChatMode);

  function handleChatSend() {
    const message = chatInputRef?.current?.value;

    if (message.length) {
      socket.emit('chat', { ...socketData, message: message, mode: chatMode });
    }

  }

  useEffect(() => {
    const lastMessage = chatBoxRef?.current?.lastElementChild;

    const isScrolledToBottom = Math.ceil(chatBoxRef?.current?.scrollTop + chatBoxRef?.current?.clientHeight) >= prevScrollHeight;

    setPrevScrollHeight(chatBoxRef?.current?.scrollHeight);

    if (isScrolledToBottom) {
      lastMessage?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }

  }, [chatMessages]);

  return (
    <div className={`flex flex-col justify-between w-full bg-white rounded-lg px-2 pt-2 shadow ${className}`}>
      <div ref={chatBoxRef} className='flex flex-col gap-2 h-[58vh] w-full overflow-y-scroll pr-1'>
        {chatMessages?.map((msg, i)=> <div key={msg + '_' + i} className='flex-none text-balance whitespace-normal break-words'>
          { msg.mode && msg.mode != 'log' && !hideTeam ?
            <span className='mr-1' style={{ color: msg.modeColour }}>
              {
                '[' + msg.mode?.toUpperCase() + ']'
              }
            </span>
            : undefined
          }

          <span style={{ color: msg.senderColour }}>
            {msg.sender}
            <span className={msg.mode != 'log' ? 'mr-1' : ''}>{msg.mode == 'log' ? '' : ':'}</span>
          </span >

          <span style={{ color: msg.messageColour }}>
            {msg.message}
          </span >
        </div>)}
      </div>

      <div>
        <ChatInput
          inputRef={chatInputRef}
          placeholder=""
          className='w-full'
          onSend={handleChatSend}
          charLimit={50}
          hideTeam={hideTeam}
        />

      </div>
    </div>
  );
}
