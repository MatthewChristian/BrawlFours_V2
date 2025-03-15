import React, { ReactNode, useState } from 'react'
import { Tooltip } from 'react-tooltip'
import Button from '../Button';

interface Props {
  children?: ReactNode;
  shortcode: string;
  message?: string;
  onConfirm: () => void;
}

export default function Popconfirm({ children, message, shortcode, onConfirm }: Props) {

  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div>

      {children}


      <Tooltip
        border="1px solid #9ca3af"
        anchorSelect={`.${shortcode}`}
        place="top"
        openOnClick
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        closeEvents={{ click: true }}
        className={'popconfirm-tooltip shadow-[0px_0px_26px_rgba(0,0,0,0.25)]'}
        opacity={1}
        clickable
      >
        <div>
          {message}
          <div className='flex flex-row justify-end gap-2 mt-2'>
            <Button className='blue-button text-xs rounded-xl' padding='px-2 py-1' onClick={onConfirm}>
              Yes
            </Button>

            <Button className='red-button text-xs rounded-xl' padding='px-2 py-1' onClick={() => setIsOpen(false)}>
              No
            </Button>
          </div>
        </div>
      </Tooltip>
    </div>
  )
}
