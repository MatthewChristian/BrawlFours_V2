import React, { useEffect, useRef, useState } from 'react';
import { socket } from '../SocketClient';
import { BasicRoomInput } from '../../models/BasicRoomInput';
import { useAppSelector } from '../../store/hooks';
import { getChatMessages, getChatMode } from '../../slices/chat.slice';
import ChatInput from '../../core/components/ChatInput';
import { getMobileView } from '../../slices/game.slice';
import { motion } from 'framer-motion';
import { IoCloseOutline } from 'react-icons/io5';

interface Props {
  socketData?: BasicRoomInput;
  className?: string
  hideTeam?: boolean;
  hideInput?: boolean;
  expand?: boolean;
  setExpand?: (val: boolean) => void;
  isMobileChat?: boolean;
}

export default function Chatbox({ socketData, className, hideTeam, hideInput, expand, setExpand, isMobileChat }: Props) {

  const mobileView = useAppSelector(getMobileView);

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
    <motion.div
      animate={isMobileChat ? {
        height: expand ? '80vh' : '13vh',
        position: 'absolute',
        width: '95%',
        bottom: 8,
        left: '2.5%',
        zIndex: 90,
      } : undefined}
      className={`flex flex-col justify-between w-full ${mobileView ? 'h-full' : ''} bg-white rounded-lg px-2 pt-2 shadow ${className}`}
    >

      {expand &&
        <div className='flex flex-row justify-end' onClick={() => setExpand(false)}>
          <IoCloseOutline size={32} color='#6b7280' />
        </div>
      }

      <div ref={chatBoxRef} className={'flex flex-col gap-2 w-full h-full overflow-y-scroll pr-1'}>


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

      { hideInput && !expand ?
        <></>
        :
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
      }
    </motion.div>
  );
}
