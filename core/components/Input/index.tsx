import React, { RefObject } from 'react';

interface Props {
  inputRef: RefObject<HTMLInputElement>;
  className?: string;
  placeholder?: string;
  onChange?: (val: string) => void;
}

export default function Input({ inputRef, className, placeholder, onChange  }: Props) {
  return (
    <input
      type="text"
      className={`rounded-lg bg-white p-2 border border-black focus:border-blue-600 ${className}`}
      ref={inputRef}
      placeholder={placeholder ?? 'Enter input...'}
      onChange={(val) => onChange ? onChange(val.target.value) : undefined}
    />
  );
}
