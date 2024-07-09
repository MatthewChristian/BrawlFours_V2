import React from 'react';
import StatusIcon from '../../../core/components/StatusIcon';

export default function DealerIcon() {
  return (
    <StatusIcon
      icon={<div className='bg-blue-200 border-2 border-blue-500 text-blue-500 rounded-lg h-7 w-7 flex flex-row justify-center items-center'>D</div>}
    />
  );
}
