import React from 'react'

interface Props {
  children?: JSX.Element | string;
  onClick?: () => void;
  className?: string;
}

export default function Button({ children, onClick, className }: Props) {
  return (
    <div>
      <button className={'rounded-lg' + className} onClick={() => onClick ? onClick() : undefined}>
        {children}
      </button>
    </div>
  )
}
