import React from 'react';
import { Tooltip } from 'react-tooltip';

interface Props {
  children?: JSX.Element | string;
  onClick?: () => void;
  className?: string;
  iconClassName?: string;
  disabled?: boolean;
  icon?: JSX.Element;
  padding?: string;
  tooltip?: string;
  tooltipAnchor?: string;
}

export default function Button({ children, onClick, className, iconClassName, disabled, icon, padding, tooltip, tooltipAnchor }: Props) {
  return (
    <>
      <button className={`rounded-lg ${padding ?? 'p-2'} flex flex-row items-center justify-center transition-colors ${disabled ? 'disabled-button' : 'cursor-pointer'} ${tooltipAnchor} ${className}`} onClick={() => onClick && !disabled ? onClick() : undefined}>
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

      {tooltip && tooltipAnchor &&
        <Tooltip
          anchorSelect={`.${tooltipAnchor}`}
          place="top"
        >
          <div>
            {tooltip}
          </div>
        </Tooltip>
      }
    </>
  );
}
