import React from 'react';

interface Props {
  children?: JSX.Element | string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export default function Button({ children, onClick, className, disabled }: Props) {
  return (
    <div className={`rounded-lg p-2 w-fit transition-colors ${disabled ? 'disabled-button' : 'cursor-pointer'} ${className}`} onClick={() => onClick && !disabled ? onClick() : undefined}>
      {children}
    </div>
  );
}
