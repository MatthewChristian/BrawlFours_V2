import React, { RefObject, useEffect, useState } from 'react';
import { IoSend } from 'react-icons/io5';
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
  hideTeam?: boolean;
}

export default function ChatInput({ inputRef, className, placeholder, onChange, defaultValue, onSend, charLimit, hideTeam }: Props) {

  const dispatch = useAppDispatch();

  const chatMode = useAppSelector(getChatMode);

  const [inputVal, setInputVal] = useState<string>('');

  const toggleClassName = 'hover:cursor-pointer transition ease-in-out duration-300 text-white text-sm flex items-center justify-center w-16 h-10 px-2 mr-1';

  function handleOnChange(value: string) {
    setInputVal(value ?? '');

    if (onChange) {
      onChange(value);
    }
  }

  function handleSend() {
    // If message is too long, do not send it to the server
    if (charLimit && inputVal.length > charLimit) {
      return;
    }

    if (onSend) {
      onSend();
    }

    setInputVal('');
    inputRef.current.value = '';
  }

  return (
    <div>
      <div className='rounded-lg bg-white border border-black flex flex-row justify-between items-center shadow-md'>

        {
          hideTeam ? undefined
            :
            chatMode == 'all' ?
              <button
                className={`bg-red-500 hover:bg-red-400 ${toggleClassName}`}
                style={{ borderTopLeftRadius: 7, borderBottomLeftRadius: 7 }}
                onClick={() => dispatch(setChatMode('team'))}
              >
                ALL
              </button>
              : chatMode == 'team' ?
                <button
                  className={`bg-green-500 hover:bg-green-400 ${toggleClassName}`}
                  style={{ borderTopLeftRadius: 7, borderBottomLeftRadius: 7 }}
                  onClick={() => dispatch(setChatMode('all'))}
                >
                  TEAM
                </button>
                : undefined
        }

        <input
          type="text"
          className={`${className} px-2`}
          ref={inputRef}
          placeholder={placeholder ?? 'Enter input...'}
          onChange={(val) => handleOnChange(val.target.value)}
          defaultValue={defaultValue}
          onKeyDown={(target) => { target.key == 'Enter' ? handleSend() : undefined; }}
        />

        <button
          className='ml-1 p-2 transition ease-in-out duration-300 text-sky-500 hover:text-sky-400 hover:cursor-pointer'
          onClick={handleSend}
        >
          <IoSend size={24} />
        </button>

      </div>

      {charLimit ?
        <div className={`${inputVal?.length > charLimit ? 'text-red-400' : 'text-gray-400'} text-sm flex justify-end mx-2`}>{inputVal?.length}/{charLimit}</div>
        : undefined
      }
    </div>
  );
}
