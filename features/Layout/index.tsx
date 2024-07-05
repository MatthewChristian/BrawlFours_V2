import React, {  useEffect, useRef } from 'react';
import { Socket, io } from 'socket.io-client';
import { setDeck, setErrorMsg, setJoinModalOpen, setKickedCards, setPlayerCards, setPlayerList, setRoomId } from '../../slices/game.slice';
import { useAppDispatch } from '../../store/hooks';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';

interface Props {
  Component: any;
  pageProps: any;
}

export default function Layout({ Component, pageProps }: Props) {
  // Manage socket.io websocket
  const socket = useRef<Socket>(io('http://localhost:3000'));

  const router = useRouter();

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
        console.log('Error Msg: ', data.errorMsg);
        if (data.errorMsg == 'Sorry, this room does not exist!') {
          router.push('/');
        }
        toast(data.errorMsg, {
          type: 'error',
          hideProgressBar: true
        });
        // dispatch(setErrorMsg(data.errorMsg));
      }
    });

    socket.current.on('deck', (deck) => {
      dispatch(setDeck(deck));
    });

    socket.current.on('kickedCards', (cards) => {
      dispatch(setKickedCards(cards));
    });

    socket.current.on('playerCards', (cards) => {
      console.log('PC: ', cards);
      dispatch(setPlayerCards(cards));
    });
  }, [socket]);

  return (
    <Component {...pageProps} socket={socket} />
  );
}
