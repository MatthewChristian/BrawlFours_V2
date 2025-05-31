import React, { useEffect, useRef } from 'react';
import { PlacesType, Tooltip, TooltipRefProps } from 'react-tooltip';
import { useAppSelector } from '../../../store/hooks';
import { getSettingsModalVisible } from '../../../slices/game.slice';

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
  tooltipPlacement?: PlacesType;
}

export default function Button({ children, onClick, className, iconClassName, disabled, icon, padding, tooltip, tooltipAnchor, tooltipPlacement }: Props) {

  const tooltipRef = useRef<TooltipRefProps>(null);

  const settingsModalVisible = useAppSelector(getSettingsModalVisible);

  useEffect(() => {
    if (!settingsModalVisible) {
      tooltipRef?.current?.close();
    }
  }, [settingsModalVisible]);

  return (
    <>
      <button
        className={`rounded-lg ${padding ?? 'p-2'} flex flex-row items-center justify-center transition-colors ${disabled ? 'disabled-button' : 'cursor-pointer'} ${tooltipAnchor} ${className}`}
        onClick={onClick && !disabled ? (e) => { tooltipRef?.current?.close(); onClick(); } : undefined}
      >
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
          ref={tooltipRef}
          anchorSelect={`.${tooltipAnchor}`}
          place={tooltipPlacement ?? 'top'}
        >
          <div>
            {tooltip}
          </div>
        </Tooltip>
      }
    </>
  );
}
