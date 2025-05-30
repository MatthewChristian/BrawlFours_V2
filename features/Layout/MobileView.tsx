import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setMobileView } from '../../slices/game.slice';

interface MobileViewProps {
  children: JSX.Element | JSX.Element[] | undefined;
}

export const MobileView = (props: MobileViewProps) => {
  const dispatch = useDispatch();

  function handleWindowSizeChange() {
    if (window.innerWidth <= 768) {
      console.log('Mobile');
      dispatch(setMobileView(true));
    }
    else {
      console.log('Desktop');
      dispatch(setMobileView(false));
    }
  }

  useEffect(() => {
    // Check if in mobile view
    if (window.innerWidth <= 768) dispatch(setMobileView(true));
    else dispatch(setMobileView(false));
    // Listen to resize events
    window.addEventListener('resize', handleWindowSizeChange);

    return () => {
      // Remove events
      window.removeEventListener('resize', handleWindowSizeChange);
    };
  }, [dispatch]);

  return (
    <>
      {
        props.children
      }
    </>
  );
};
