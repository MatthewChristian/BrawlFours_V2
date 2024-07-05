import React, {  useEffect, useRef } from 'react';
import { Socket, io } from 'socket.io-client';
import { setErrorMsg, setJoinModalOpen, setPlayerList, setRoomId } from '../../slices/game.slice';
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

    socket.current?.on('newRoomCreated', data => {
      dispatch(setRoomId(String(data.room_id)));
    });

    socket.current?.on('playerJoinedRoom', data => {
      if (data.success) {
        dispatch(setRoomId(String(data.room_id)));
        dispatch(setJoinModalOpen(false));
        dispatch(setErrorMsg(undefined));
      }
      else {
        dispatch(setErrorMsg(data.errorMsg));
      }
    });
  }, [socket]);

  return (
    <Component {...pageProps} socket={socket} />
  );
}
