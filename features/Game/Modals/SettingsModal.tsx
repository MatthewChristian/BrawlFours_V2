import React from 'react';
import Modal from '../../../core/components/Modal';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { getSettingsModalVisible, setSettingsModalVisible } from '../../../slices/game.slice';
import ReactSlider from 'react-slider';


interface Props {
  lobby?: boolean;
}

export default function SettingsModal({ lobby }: Props) {

  const dispatch = useAppDispatch();

  const isVisible = useAppSelector(getSettingsModalVisible);

  return (
    <Modal open={isVisible} closeOnDocumentClick={true} onClose={() => dispatch(setSettingsModalVisible(false))} centered>
      <div className='flex flex-col items-center'>
        <div className='text-lg font-bold'>
          Settings
        </div>

        <ReactSlider
          className="horizontal-slider"
          thumbClassName="example-thumb"
          trackClassName="example-track"
          renderThumb={(props, state) => <div {...props}>{state.valueNow}</div>}
        />

      </div>
    </Modal>
  );
}
