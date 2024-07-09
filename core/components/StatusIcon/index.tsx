import React, { ReactNode } from 'react';

interface Props {
  icon?: ReactNode;
  tooltip?: string;
  iconColour?: string;
  bgColour?: string;
}

export default function StatusIcon({ icon, tooltip, bgColour, iconColour }: Props) {
  return (
    <div>
      {icon}
    </div>
  );
}
