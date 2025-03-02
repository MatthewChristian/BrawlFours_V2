import React, { ReactNode } from 'react';
import { Tooltip } from 'react-tooltip';

interface Props {
  icon?: ReactNode;
  tooltip?: string;
  shortcode?: string;
  twBorderColour?: string;
  twTextColour?: string;
  twBgColour?: string;
  active?: boolean;
  onClick?: () => void;
}

export default function StatusIcon({ icon, shortcode, tooltip, twBgColour, twTextColour, twBorderColour, active, onClick }: Props) {
  return (
    active ?
      <>
        { tooltip ?
          <Tooltip anchorSelect={`.${shortcode}`} place="top" style={{ zIndex: 10000 }}>
            {tooltip}
          </Tooltip>
        : undefined
        }

        <div
          className={`border-2 rounded-lg h-7 w-7 flex flex-row justify-center items-center ${onClick ? 'cursor-pointer' : ''} ${shortcode} ${twBgColour} ${twTextColour} ${twBorderColour}`}
          onClick={onClick ? () => onClick() : undefined}
        >
          {icon}
        </div>
      </>
    : <></>
  );
}
