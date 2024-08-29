import React, {  Suspense, useEffect } from 'react';
import { setActiveAbilities, setBeg, setDealer, setDeck, setErrorMsg, setGame, setGameStarted, setJoinModalOpen, setKickedCards, setLift, setLiftWinner, setMatchWinner, setMessage, setPlayerCards, setPlayerJoinedRoom, setPlayerList, setRoomId, setRoundWinners, setTeamScore, setTurn } from '../../slices/game.slice';
import { useAppDispatch } from '../../store/hooks';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { socket } from '../SocketClient';
import { addChatMessage } from '../../slices/chat.slice';


interface Props {
  children: any
}


export default function Layout({ children }: Props) {

  const router = useRouter();

  const dispatch = useAppDispatch();

  const supportsTouch = typeof window !== 'undefined' ? 'ontouchstart' in window || navigator.maxTouchPoints : false;

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
        dispatch(setPlayerJoinedRoom(true));
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

    socket?.on('playerLeftRoom', data => {
      dispatch(setPlayerJoinedRoom(false));
      dispatch(setRoomId(undefined));
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
      dispatch(setRoundWinners(state));
    });

    socket.on('matchWinner', (state) => {
      dispatch(setMatchWinner(state));
    });

    socket.on('liftWinner', (state) => {
      dispatch(setLiftWinner(state));
    });

    socket.on('gameStarted', (state) => {
      dispatch(setGameStarted(state));
    });

    socket.on('activeAbilities', (state) => {
      dispatch(setActiveAbilities(state));
    });

    socket.on('chat', (state) => {
      dispatch(addChatMessage(state));
    });

  }, [socket]);

  return (
    <>
      <Suspense>
        {children}
      </Suspense>
    </>
  );
}
