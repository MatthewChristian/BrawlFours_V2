import React from 'react';

interface Props {
  children?: JSX.Element | string;
  onClick?: () => void;
  className?: string;
}

export default function Button({ children, onClick, className }: Props) {
  return (
    <div className={`rounded-lg p-2 w-fit transition-colors cursor-pointer ${className}`} onClick={() => onClick ? onClick() : undefined}>
      {children}
    </div>
  );
}
