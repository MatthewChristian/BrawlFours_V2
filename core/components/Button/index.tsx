import React, { RefObject, useRef } from 'react';
import { PlacesType, Tooltip, TooltipRefProps } from 'react-tooltip';
interface Props {
  externalTooltipRef?: RefObject<TooltipRefProps>;
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
  tooltipClassname?: string;
  tooltipArrowClassname?: string;
}

export default function Button({ externalTooltipRef, children, onClick, className, iconClassName, disabled, icon, padding, tooltip, tooltipAnchor, tooltipPlacement, tooltipArrowClassname, tooltipClassname }: Props) {

  const tooltipRef = useRef<TooltipRefProps>(null);

  return (
    <>
      <button
        className={`rounded-lg ${padding ?? 'p-2'} flex flex-row items-center justify-center transition-colors ${disabled ? 'disabled-button' : 'cursor-pointer'} ${tooltipAnchor} ${className}`}
        onClick={onClick && !disabled ? (e) => { (externalTooltipRef ?? tooltipRef)?.current?.close(); onClick(); } : undefined}
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
          ref={externalTooltipRef ?? tooltipRef}
          anchorSelect={`.${tooltipAnchor}`}
          place={tooltipPlacement ?? 'top'}
          className={tooltipClassname}
          classNameArrow={tooltipArrowClassname}
        >
          <div>
            {tooltip}
          </div>
        </Tooltip>
      }
    </>
  );
}
