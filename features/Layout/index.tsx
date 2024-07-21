import React, {  useEffect, useRef } from 'react';
import { Socket, io } from 'socket.io-client';
import { setBeg, setDealer, setDeck, setErrorMsg, setGame, setGameStarted, setJoinModalOpen, setKickedCards, setLift, setMatchWinner, setMessage, setPlayerCards, setPlayerList, setRoomId, setRoundWinners, setTeamScore, setTurn } from '../../slices/game.slice';
import { useAppDispatch } from '../../store/hooks';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';

interface Props {
  Component: any;
  pageProps: any;
}

export default function Layout({ Component, pageProps }: Props) {
  // Manage socket.io websocket
  const socket = useRef<Socket>(io());

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
        router.push({
          pathname: '/',
          query: undefined
        });
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

    socket.current.on('lift', (state) => {
      dispatch(setLift(state));
    });

    socket.current.on('game', (state) => {
      dispatch(setGame(state));
    });

    socket.current.on('roundWinners', (state) => {
      console.log('RW: ', state);
      dispatch(setRoundWinners(state));
    });

    socket.current.on('matchWinner', (state) => {
      console.log('MW: ', state);
      dispatch(setMatchWinner(state));
    });

    socket.current.on('gameStarted', (state) => {
      dispatch(setGameStarted(state));
    });

  }, [socket]);

  return (
    <Component {...pageProps} socket={socket} />
  );
}
