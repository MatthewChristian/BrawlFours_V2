import React, { ReactNode } from 'react';

interface Props {
  icon?: ReactNode;
  tooltip?: string;
  twBorderColour?: string;
  twTextColour?: string;
  twBgColour?: string;
}

export default function StatusIcon({ icon, tooltip, twBgColour, twTextColour, twBorderColour }: Props) {
  return (
    <div className={`border-2 rounded-lg h-7 w-7 flex flex-row justify-center items-center ${twBgColour} ${twTextColour} ${twBorderColour}`}>
      {icon}
    </div>
  );
}
