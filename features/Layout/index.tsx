import React, {  Suspense, useEffect } from 'react';
import { setActiveAbilities, setBeg, setDealer, setDeck, setDoubleLiftCards, setErrorMsg, setGame, setGameIsTwo, setGameStarted, setJoinModalOpen, setKickedCards, setLift, setLiftWinner, setMatchWinner, setMessage, setPlayerCards, setPlayerJoinedRoom, setPlayerList, setPlayerStatus, setRevealedBare, setRoomId, setRoundWinners, setTeammateCards, setTeamScore, setTurn, setTwosPlayed } from '../../slices/game.slice';
import { useAppDispatch } from '../../store/hooks';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { socket } from '../SocketClient';
import { addChatMessage, setChatMessages } from '../../slices/chat.slice';
import { ChatMessage } from '../../models/ChatMessage';


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
      router.push(`/room?roomId=${String(data.room_id)}`);
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
      dispatch(setChatMessages([]));
      router.push('/');
    });

    socket?.on('playerKicked', data => {
      dispatch(setPlayerJoinedRoom(false));
      dispatch(setRoomId(undefined));
      dispatch(setChatMessages([]));
      router.push('/');
      toast('You have been kicked from the room!', {
        type: 'error',
        hideProgressBar: true
      });
    });

    socket?.on('gameIsTwo', data => {
      dispatch(setGameIsTwo(data));
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

    socket.on('teammateCards', (cards) => {
      dispatch(setTeammateCards(cards));
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

    socket.on('chat', (state: ChatMessage) => {
      if (state.showToast) {
        toast(state.message, {
          type: 'default',
          hideProgressBar: true,
          position: 'top-center'
        });
      }

      dispatch(addChatMessage(state));
    });

    socket.on('playerStatus', (state) => {
      dispatch(setPlayerStatus(state ?? []));
    });

    socket.on('twosPlayed', (state) => {
      dispatch(setTwosPlayed(state ?? []));
    });

    socket.on('revealedBare', (state) => {
      dispatch(setRevealedBare(state));
    });

    socket.on('doubleLiftCards', (state) => {
      dispatch(setDoubleLiftCards(state));
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
