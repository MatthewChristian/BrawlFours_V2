import React, { ReactNode } from 'react';
import { Tooltip } from 'react-tooltip';

interface Props {
  icon?: ReactNode;
  tooltip?: string;
  shortcode?: string;
  twBorderColour?: string;
  twTextColour?: string;
  twBgColour?: string;
}

export default function StatusIcon({ icon, shortcode, tooltip, twBgColour, twTextColour, twBorderColour }: Props) {
  return (
    <>
    { tooltip ?
      <Tooltip anchorSelect={`.${shortcode}`} place="top">
        {tooltip}
      </Tooltip>
    : undefined
    }

    <div className={`border-2 rounded-lg h-7 w-7 flex flex-row justify-center items-center ${shortcode} ${twBgColour} ${twTextColour} ${twBorderColour}`}>
      {icon}
    </div>
    </>
  );
}
