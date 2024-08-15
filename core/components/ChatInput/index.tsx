import React, { RefObject, useState } from 'react';
import { IoSend } from "react-icons/io5";
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { getChatMode, setChatMode } from '../../../slices/chat.slice';

interface Props {
  inputRef?: RefObject<HTMLInputElement>;
  className?: string;
  placeholder?: string;
  onChange?: (val: string) => void;
  defaultValue?: string;
  onSend?: () => void;
  charLimit?: number;
}

export default function ChatInput({ inputRef, className, placeholder, onChange, defaultValue, onSend, charLimit }: Props) {

  const dispatch = useAppDispatch();

  const chatMode = useAppSelector(getChatMode);

  const toggleClassName = 'hover:cursor-pointer transition ease-in-out duration-300 text-white text-sm flex items-center justify-center w-16 h-10 px-2 mr-1';

  function handleOnChange(value: string) {
    if (onChange) {
      onChange(value);
    }
  }

  return (
    <div>
      <div className='rounded-lg bg-white border border-black flex flex-row justify-between items-center shadow-md'>

      { chatMode == 'all' ?
        <div
          className={`bg-red-500 hover:bg-red-400 ${toggleClassName}`}
          style={{ borderTopLeftRadius: 7, borderBottomLeftRadius: 7 }}
          onClick={() => dispatch(setChatMode('team'))}
        >
          ALL
        </div>
        : chatMode == 'team' ?
         <div
          className={`bg-green-500 hover:bg-green-400 ${toggleClassName}`}
          style={{ borderTopLeftRadius: 7, borderBottomLeftRadius: 7 }}
          onClick={() => dispatch(setChatMode('all'))}
        >
          TEAM
        </div>
        : undefined
      }

        <input
          type="text"
          className={`${className} p-2`}
          ref={inputRef}
          placeholder={placeholder ?? 'Enter input...'}
          onChange={(val) => handleOnChange(val.target.value)}
          defaultValue={defaultValue}
          onKeyDown={onSend ? (target) => { target.key == 'Enter' ? onSend() : undefined; } : undefined}
        />

        <div
          className='ml-1 p-2 transition ease-in-out duration-300 text-sky-500 hover:text-sky-400 hover:cursor-pointer'
          onClick={onSend ? () => onSend() : undefined}
        >
          <IoSend size={24} />
        </div>

      </div>

      {charLimit ?
        <div className={`${inputRef?.current?.value?.length > charLimit ? 'text-red-400' : 'text-gray-400'} text-sm flex justify-end mx-2`}>{inputRef?.current?.value?.length}/{charLimit}</div>
        : undefined
      }
    </div>
  );
}
