import React, {  useEffect, useRef } from 'react';
import { Socket, io } from 'socket.io-client';
import { setPlayerList } from '../../slices/game.slice';
import { useAppDispatch } from '../../store/hooks';

interface Props {
  Component: any;
  pageProps: any;
}

export default function Layout({ Component, pageProps }: Props) {
  // Manage socket.io websocket
  const socket = useRef<Socket>(io('http://localhost:3000'));

  const dispatch = useAppDispatch();


  useEffect(() => {

    console.log('UE: ', { ...socket });

    if (!socket.current) {
      return;
    }

    socket.current.on('playersInRoom', (players) => {
      dispatch(setPlayerList(players));
    });
  }, [socket]);

  return (
    <Component {...pageProps} socket={socket} />
  );
}
