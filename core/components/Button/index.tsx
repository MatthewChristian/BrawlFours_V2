import React from 'react';

interface Props {
  children?: JSX.Element | string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  icon?: JSX.Element;
}

export default function Button({ children, onClick, className, disabled, icon }: Props) {
  return (
    <div className={`rounded-lg p-2 w-fit flex flex-row items-center transition-colors ${disabled ? 'disabled-button' : 'cursor-pointer'} ${className}`} onClick={() => onClick && !disabled ? onClick() : undefined}>
      {
        icon ?
          <div className='mr-2'>
            {icon}
          </div> : undefined
      }
      {children}
    </div>
  );
}
