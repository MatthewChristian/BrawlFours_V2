import React, {  useEffect, useRef } from 'react';
import { Socket, io } from 'socket.io-client';
import { setBeg, setDealer, setDeck, setErrorMsg, setJoinModalOpen, setKickedCards, setMessage, setPlayerCards, setPlayerList, setRoomId, setTeamScore, setTurn } from '../../slices/game.slice';
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
        router.push('/');
        toast(data.errorMsg, {
          type: 'error',
          hideProgressBar: true
        });
      }
    });

    socket.current.on('deck', (deck) => {
      dispatch(setDeck(deck));
    });

    socket.current.on('kickedCards', (cards) => {
      dispatch(setKickedCards(cards));
    });

    socket.current.on('playerCards', (cards) => {
      dispatch(setPlayerCards(cards));
    });

    socket.current.on('dealer', (state) => {
      dispatch(setDealer(state));
    });

    socket.current.on('turn', (state) => {
      dispatch(setTurn(state));
    });

    socket.current.on('beg', (state) => {
      dispatch(setBeg(state));
    });

    socket.current.on('teamScore', (state) => {
      dispatch(setTeamScore(state));
    });

    socket.current.on('message', (state) => {
      dispatch(setMessage(state));
    });
  }, [socket]);

  return (
    <Component {...pageProps} socket={socket} />
  );
}
