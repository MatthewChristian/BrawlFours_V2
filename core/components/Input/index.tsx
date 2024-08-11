import React, { RefObject, useState } from 'react';
import { IoSend } from "react-icons/io5";

interface Props {
  inputRef?: RefObject<HTMLInputElement>;
  className?: string;
  placeholder?: string;
  onChange?: (val: string) => void;
  defaultValue?: string;
  hasSendButton?: boolean;
  onSend?: () => void;
  charLimit?: number;
}

export default function Input({ inputRef, className, placeholder, onChange, defaultValue, hasSendButton, onSend, charLimit }: Props) {

  const [inputVal, setInputVal] = useState<string>('');

  function handleOnChange(value: string) {
    setInputVal(value);

    if (onChange) {
      onChange(value);
    }
  }

  return (
    <div>
      <div className='rounded-lg bg-white p-2 border border-black flex flex-row justify-between items-center'>
        <input
          type="text"
          className={`${className}`}
          ref={inputRef}
          placeholder={placeholder ?? 'Enter input...'}
          onChange={(val) => handleOnChange(val.target.value)}
          defaultValue={defaultValue}
          onKeyDown={onSend ? (target) => { target.key == 'Enter' ? onSend() : undefined; } : undefined }
        />
        {
          hasSendButton ?
            <div
              className='ml-1 transition ease-in-out duration-300 text-sky-500 hover:text-sky-400 hover:cursor-pointer'
              onClick={onSend ? () => onSend() : undefined}
            >
            <IoSend size={24} />
          </div>
          : undefined
        }
      </div>

      <div className='text-gray-400 text-sm flex justify-end mx-2'>{inputVal.length}/{charLimit}</div>
    </div>
  );
}
