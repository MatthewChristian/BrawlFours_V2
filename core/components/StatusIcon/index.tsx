import { AnimatePresence, motion } from 'framer-motion';
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
    active &&
      <motion.div
        key={shortcode}
        layout
        transition={{ type: 'spring', duration: 0.5 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0 }}
        className={`border-2 rounded-lg h-7 w-7 flex flex-row justify-center items-center ${onClick ? 'cursor-pointer' : ''} ${shortcode} ${twBgColour} ${twTextColour} ${twBorderColour}`}
        onClick={onClick ? () => onClick() : undefined}
      >
        {icon}

        {tooltip ?
          <Tooltip
            anchorSelect={`.${shortcode}`}
            place="top"
            className={'border border-white'}
            classNameArrow={'border border-white border-t-0 border-l-0'}
            style={{ zIndex: 10000, maxWidth: '80vw' }}
          >
            {tooltip}
          </Tooltip>
          : undefined
        }
      </motion.div>
  );
}
