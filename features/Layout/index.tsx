import React, {  Suspense, useEffect } from 'react';
import { setBeg, setDealer, setDeck, setErrorMsg, setGame, setGameStarted, setJoinModalOpen, setKickedCards, setLift, setMatchWinner, setMessage, setPlayerCards, setPlayerList, setRoomId, setRoundWinners, setTeamScore, setTurn } from '../../slices/game.slice';
import { useAppDispatch } from '../../store/hooks';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { socket } from '../SocketClient';


interface Props {
  children: any
}


export default function Layout({ children }: Props) {
  // Manage socket.io websocket
  const router = useRouter();

  const dispatch = useAppDispatch();

  useEffect(() => {

    if (!socket) {
      return;
    }

    socket.on('playersInRoom', (players) => {
      dispatch(setPlayerList(players));
    });

    socket?.on('newRoomCreated', data => {
      dispatch(setRoomId(String(data.room_id)));
    });

    socket?.on('playerJoinedRoom', data => {
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

    socket.on('deck', (deck) => {
      dispatch(setDeck(deck));
    });

    socket.on('kickedCards', (cards) => {
      dispatch(setKickedCards(cards));
    });

    socket.on('playerCards', (cards) => {
      dispatch(setPlayerCards(cards));
    });

    socket.on('dealer', (state) => {
      dispatch(setDealer(state));
    });

    socket.on('turn', (state) => {
      dispatch(setTurn(state));
    });

    socket.on('beg', (state) => {
      dispatch(setBeg(state));
    });

    socket.on('teamScore', (state) => {
      dispatch(setTeamScore(state));
    });

    socket.on('message', (state) => {
      dispatch(setMessage(state));
    });

    socket.on('lift', (state) => {
      dispatch(setLift(state));
    });

    socket.on('game', (state) => {
      dispatch(setGame(state));
    });

    socket.on('roundWinners', (state) => {
      console.log('RW: ', state);
      dispatch(setRoundWinners(state));
    });

    socket.on('matchWinner', (state) => {
      console.log('MW: ', state);
      dispatch(setMatchWinner(state));
    });

    socket.on('gameStarted', (state) => {
      dispatch(setGameStarted(state));
    });

  }, [socket]);

  return (
    <>
      <Suspense >
        {children}
      </Suspense>
      {/* <Component {...pageProps} socket={socket} /> */}
    </>
  );
}
