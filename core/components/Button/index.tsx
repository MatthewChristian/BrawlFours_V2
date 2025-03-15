import React from 'react';

interface Props {
  children?: JSX.Element | string;
  onClick?: () => void;
  className?: string;
  iconClassName?: string;
  disabled?: boolean;
  icon?: JSX.Element;
  padding?: string;
}

export default function Button({ children, onClick, className, iconClassName, disabled, icon, padding }: Props) {
  return (
    <button className={`rounded-lg ${padding ?? 'p-2'} w-fit flex flex-row items-center transition-colors ${disabled ? 'disabled-button' : 'cursor-pointer'} ${className}`} onClick={() => onClick && !disabled ? onClick() : undefined}>
      {
        icon ?
          <div className={iconClassName ?? 'mr-2'}>
            {icon}
          </div> : undefined
      }
      <div className='relative top-[2px]'>
        {children}
      </div>
    </button>
  );
}
