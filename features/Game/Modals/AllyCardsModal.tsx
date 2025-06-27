import React from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { getAllyCardsViewExpanded, toggleAllyCardsViewExpanded } from '../../../slices/game.slice';
import Button from '../../../core/components/Button';
import { IoEye } from 'react-icons/io5';
import { motion } from 'framer-motion';
import { DeckCard } from '../../../models/DeckCard';
import PlayingCard from '../PlayingCard';

interface Props {
  disabled?: boolean;
  name?: string;
  cards?: DeckCard[];
  allySelectionModalVisible?: boolean;
  handleSelectAllyCard?: (card: DeckCard) => void;
}

export default function AllyCardsModal({ disabled, name, cards, allySelectionModalVisible, handleSelectAllyCard }: Props) {

  const dispatch = useAppDispatch();

  const isExpanded = useAppSelector(getAllyCardsViewExpanded) || allySelectionModalVisible;

  return (
    <>
      <div className='z-40 relative'>
        <Button
          disabled={disabled}
          className='blue-button'
          iconClassName='relative'
          icon={<IoEye size={20} />}
          onClick={() => dispatch(toggleAllyCardsViewExpanded())}
        />
      </div>

      <motion.div
        animate={{
          display: isExpanded ? undefined : 'none',
          height: isExpanded ? '20vh' : '0vh',
          width: isExpanded ? '91vw' : '0vw',
          position: 'absolute',
          top: '16%',
          left: '5%',
          zIndex: 30
        }}
        className='bg-white rounded-lg shadow-[0px_0px_26px_rgba(0,0,0,0.25)]'>

        { isExpanded ?
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
          >
            <div className='mt-2 flex flex-row justify-center font-bold text-lg'>
              {name}&apos;s hand
            </div>

            <div className='flex flex-row justify-center'>
              {
                cards.map((card, i) =>
                  <PlayingCard
                    key={'m3' + i}
                    player={3}
                    cardData={card}
                    isNotPlayable={!allySelectionModalVisible}
                    className='-mx-2 p-0'
                    spotlighted={allySelectionModalVisible}
                    glow={allySelectionModalVisible ? 'blue' : undefined}
                    onClickHandler={() => cards.length == 0 ? undefined : allySelectionModalVisible ? handleSelectAllyCard(card) : undefined}
                  />
                )
              }
            </div>
          </motion.div>
          : <></>
        }


      </motion.div>
    </>
  );
}
