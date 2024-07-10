import React, { useState, useEffect, useRef, RefObject, useMemo } from 'react';
import { Socket } from 'socket.io-client';
import { DeckCard } from '../../models/DeckCard';
import { PlayerHand } from '../../models/PlayerHand';
import PlayingCard from './PlayingCard';
import { useAppSelector } from '../../store/hooks';
import { getBeg, getDealer, getDeck, getKickedCards, getPlayerCards, getPlayerList, getTurn } from '../../slices/game.slice';
import { useRouter } from 'next/router';
import { PlayerData } from '../../models/PlayerData';
import { PlayerSocket } from '../../models/PlayerSocket';
import DealerIcon from './StatusIcons/DealerIcon';
import TurnIcon from './StatusIcons/TurnIcon';
import Popup from 'reactjs-popup';
import Modal from '../../core/components/Modal';
import Button from '../../core/components/Button';
import { toast } from 'react-toastify';
import GameInfo from './GameInfo';

interface Props {
  socket: RefObject<Socket>;
  roomId?: string;
}


export default function Gameboard({ socket, roomId }: Props) {

  const router = useRouter();

  const player2StatusIconsRef = useRef<HTMLDivElement>(null);
  const player4StatusIconsRef = useRef<HTMLDivElement>(null);


  const players = useAppSelector(getPlayerList);

  const deck = useAppSelector(getDeck);

  const kickedCards = useAppSelector(getKickedCards);

  const dealer = useAppSelector(getDealer);

  const playerTurn = useAppSelector(getTurn);

  const begState = useAppSelector(getBeg);

  // Cards in the hand of the client player
  const playerCards = useAppSelector(getPlayerCards);


  const [begModalVisible, setBegModalVisible] = useState<boolean>(false);
  const [begResponseModalVisible, setBegResponseModalVisible] = useState<boolean>(false);
  const [waitingBegResponseModalVisible, setWaitingBegResponseModalVisible] = useState<boolean>(false);


  const socketData = useMemo(() => {
    return ({
      roomId: String(roomId),
    });
  }, [roomId]);

  // Get player number from server
  const playerNumber = useMemo(() => {
    return players.find(el => el.id == socket.current.id)?.player;
  }, [players]);

  // Determine whether or not it is the turn of the client player
  const isPlayer1Turn = useMemo(() => {
    if (playerNumber == playerTurn) {
      return true;
    }

    return false;
  }, [playerTurn, playerNumber]);

  // Determine whether or not client player is the dealer
  const isPlayer1Dealer = useMemo(() => {
    if (playerNumber == dealer) {
      return true;
    }

    return false;
  }, [dealer, playerNumber]);

  // Get name of player whose turn it is
  const turnPlayerName = useMemo(() => {
    return players.find(el => el.player == playerTurn)?.nickname;
  }, [playerTurn, players]);


  // Get name of dealer
  const dealerName = useMemo(() => {
    return players.find(el => el.player == dealer)?.nickname;
  }, [dealer, players]);

  // Indicate if the game has been initialised as yet
  const [loaded, setLoaded] = useState(false);

  // React refs for player hand div
  const player1Hand = useRef(null);
  const player2Hand = useRef(null);
  const player3Hand = useRef(null);
  const player4Hand = useRef(null);

  // React states to manage what cards players have
  const [player1Cards, setPlayer1Cards] = useState<DeckCard[]>([]);

  const [player1Data, setPlayer1Data] = useState<PlayerData>({});
  const [player2Data, setPlayer2Data] = useState<PlayerData>({});
  const [player3Data, setPlayer3Data] = useState<PlayerData>({});
  const [player4Data, setPlayer4Data] = useState<PlayerData>({});

  // React states to manage what cards players played in a round
  const [player1CardPlayed, setPlayer1CardPlayed] = useState<DeckCard>();
  const [player2CardPlayed, setPlayer2CardPlayed] = useState<DeckCard>();
  const [player3CardPlayed, setPlayer3CardPlayed] = useState<DeckCard>();
  const [player4CardPlayed, setPlayer4CardPlayed] = useState<DeckCard>();


  function getTeam2CardMargins(length: number) {
    return ({
      marginTop: (-6 + (length / 3) - 2) * length,
      marginBottom: (-6 + (length / 3) - 2) * length
    });
  }

  function getTeam2GridCols(statusRef: RefObject<HTMLDivElement>) {
    if (!statusRef?.current) {
      return '';
    }

    console.log('L: ', statusRef.current.childNodes.length);

    if (statusRef.current.childNodes.length == 1) {
      return 'grid-cols-1';
    }
    else if (statusRef.current.childNodes.length == 2) {
      return 'grid-cols-2';
    }
    else {
      return 'grid-cols-3';
    }
  }

  /*
    Render player cards on the screen
  */
  function displayPlayerCards(player: DeckCard[]) {
    setPlayer1Cards(player);
  }

  function beg() {
    console.log('Begged');
  }

  function playCard() {
    console.log('Card clicked');
  }

  /*
    Initialise game
  */
  // useEffect(() => {

  //   socket.current?.emit('playerCards', socketData);

  // }, [deck, kickedCards]);

  useEffect(() => {
    if (!kickedCards || !playerCards || kickedCards.length == 0 || playerCards.length == 0) {
      return;
    }

    displayPlayerCards(playerCards);
  }, [playerCards, kickedCards]);

  /*
    Generate deck
  */
  useEffect(() => {
    socket.current?.emit('generateDeck', socketData);
  }, [socketData]);


  useEffect(() => {

    if (!players || players.length == 0) {
      return;
    }

    const playerDataServer: PlayerSocket[] = [];

    players.forEach((el) => {
      playerDataServer[el.player] = el;
    });

    setPlayer1Data({
      numCards: playerDataServer[playerNumber].numCards,
      nickname: playerDataServer[playerNumber].nickname,
      team: playerDataServer[playerNumber].team,
    });

    if (playerNumber == 1) {
      setPlayer2Data({
        numCards: playerDataServer[2].numCards,
        nickname: playerDataServer[2].nickname,
        team: playerDataServer[2].team,
      });

      setPlayer3Data({
        numCards: playerDataServer[3].numCards,
        nickname: playerDataServer[3].nickname,
        team: playerDataServer[3].team,
      });

      setPlayer4Data({
        numCards: playerDataServer[4].numCards,
        nickname: playerDataServer[4].nickname,
        team: playerDataServer[4].team,
      });
    }
    else if (playerNumber == 2) {
      setPlayer2Data({
        numCards: playerDataServer[3].numCards,
        nickname: playerDataServer[3].nickname,
        team: playerDataServer[3].team,
      });

      setPlayer3Data({
        numCards: playerDataServer[4].numCards,
        nickname: playerDataServer[4].nickname,
        team: playerDataServer[4].team,
      });

      setPlayer4Data({
        numCards: playerDataServer[1].numCards,
        nickname: playerDataServer[1].nickname,
        team: playerDataServer[1].team,
      });


    }
    else if (playerNumber == 3) {
      setPlayer2Data({
        numCards: playerDataServer[4].numCards,
        nickname: playerDataServer[4].nickname,
        team: playerDataServer[3].team,
      });

      setPlayer3Data({
        numCards: playerDataServer[1].numCards,
        nickname: playerDataServer[1].nickname,
        team: playerDataServer[1].team,
      });

      setPlayer4Data({
        numCards: playerDataServer[2].numCards,
        nickname: playerDataServer[2].nickname,
        team: playerDataServer[2].team,
      });
    }
    else if (playerNumber == 4) {
      setPlayer2Data({
        numCards: playerDataServer[1].numCards,
        nickname: playerDataServer[1].nickname,
        team: playerDataServer[1].team,
      });

      setPlayer3Data({
        numCards: playerDataServer[2].numCards,
        nickname: playerDataServer[2].nickname,
        team: playerDataServer[2].team,
      });

      setPlayer4Data({
        numCards: playerDataServer[3].numCards,
        nickname: playerDataServer[3].nickname,
        team: playerDataServer[3].team,
      });
    }

  }, [players, playerNumber]);

  useEffect(() => {
    if (begState == 'begging' && isPlayer1Turn) {
      setBegModalVisible(true);
    }
  }, [begState, isPlayer1Turn]);

  useEffect(() => {
    if (!begState) {
      return;
    }

    if (begState == 'begged') {
      if (isPlayer1Dealer) {
        setBegResponseModalVisible(true);
      }
      else if (isPlayer1Turn) {
        setBegModalVisible(false);
        setWaitingBegResponseModalVisible(true);
      }
      else {
        toast(turnPlayerName + ' begged!', {
          type: 'default',
          hideProgressBar: true,
          position: 'top-center'
        });
      }
    }
    else if (begState == 'stand') {
      setBegModalVisible(false);
      toast(turnPlayerName + ' stood!', {
        type: 'default',
        hideProgressBar: true,
        position: 'top-center'
      });
    }
    else if (begState == 'give') {
      setBegResponseModalVisible(false);
      setWaitingBegResponseModalVisible(false);
      toast(dealerName + ' gave a point!', {
        type: 'default',
        hideProgressBar: true,
        position: 'top-center'
      });
    }
    else if (begState == 'run') {
      setBegResponseModalVisible(false);
      setWaitingBegResponseModalVisible(false);
      toast(dealerName + ' ran the pack!', {
        type: 'default',
        hideProgressBar: true,
        position: 'top-center'
      });
    }
  }, [begState, isPlayer1Dealer, isPlayer1Turn, turnPlayerName, dealerName]);

  useEffect(() => {
    if (!roomId) {
      return;
    }

    socket.current.emit('joinRoom', socketData);
  }, [roomId]);

  return (
    <div className="h-screen w-screen">

      <div className='flex flex-row'>

        <GameInfo playerTurn={playerTurn} />

        <div className="h-screen w-4/5">

          <div className='h-[25vh] flex flex-col justify-between  bg-orange-200'>
            <div className='flex flex-col items-center justify-center p-3'>
              <div className='flex justify-center'>
                {
                  player3Data.nickname
                }
              </div>

              <div className='flex flex-row gap-2'>
                <DealerIcon active={dealer == 3} />
              </div>
            </div>

            <div className="bg-yellow-500 w-full flex flex-row justify-center" ref={player3Hand}>
              {
                Array.from({ length: player3Data.numCards }, (_, k) => (
                  <PlayingCard key={'3' + k} player={3} isDeckCard className='-mx-2 p-0'></PlayingCard>
                ))
              }
            </div>
          </div>

          <div className='flex flex-row'>

            <div className='flex flex-col justify-center items-center w-2/12'>
              <div >
                {
                  player4Data.nickname
                }
              </div>

              <div className={`grid gap-2 ${getTeam2GridCols(player4StatusIconsRef)}`} ref={player4StatusIconsRef}>
                <DealerIcon active={dealer == 4} />
              </div>
            </div>

            <div className="bg-blue-500 w-1/6 h-[50vh] flex flex-col items-center justify-center gap-0" ref={player2Hand}>
              {
                Array.from({ length: player4Data.numCards }, (_, k) => (
                  <PlayingCard key={'4' + k} player={4} isDeckCard className='rotate-90 p-0' style={getTeam2CardMargins(player4Data.numCards)} ></PlayingCard>
                ))
              }
            </div>

            <div className='bg-sky-200 w-4/6 flex justify-center items-center'>


              <PlayingCard cardData={player1CardPlayed} className="played-1"></PlayingCard>
              <PlayingCard cardData={player2CardPlayed} className="played-2"></PlayingCard>
              <PlayingCard cardData={player3CardPlayed} className="played-3"></PlayingCard>
              <PlayingCard cardData={player4CardPlayed} className="played-4"></PlayingCard>
            </div>

            <div className="bg-green-500 w-1/6 h-[50vh] flex flex-col items-center justify-center gap-0" ref={player4Hand}>
              {
                Array.from({ length: player2Data.numCards }, (_, k) => (
                  <PlayingCard key={'2' + k} player={2} isDeckCard className='rotate-90 p-0' style={getTeam2CardMargins(player2Data.numCards)}></PlayingCard>
                ))
              }

            </div>

            <div className='flex flex-col justify-center items-center w-2/12'>
              <div >
                {
                  player2Data.nickname
                }
              </div>

              <div className={`grid gap-2 ${getTeam2GridCols(player2StatusIconsRef)}`} ref={player2StatusIconsRef}>
                <DealerIcon active={dealer == 2} />
                <TurnIcon active={playerTurn == 2} />
              </div>
            </div>

          </div>

          <div className='h-[25vh] bg-purple-200'>
            <div className="bg-red-500 w-full flex flex-row justify-center" ref={player1Hand}>
              {
                Array.from({ length: player1Cards.length == 0 ? player1Data.numCards : player1Cards.length}, (_, k) => (
                  <PlayingCard key={'1' + k} player={1} cardData={player1Cards[k]} isDeckCard={player1Cards.length == 0 ? true : false} onClickHandler={playCard} className='-mx-2'></PlayingCard>
                ))
              }
            </div>

            <div className='flex flex-col items-center justify-center p-3'>
              <div>
                {
                  player1Data.nickname
                }
              </div>

              <div className='flex flex-row gap-2'>
                <DealerIcon active={dealer == 1}/>
                <TurnIcon active={playerTurn == 1} />
              </div>

            </div>
          </div>

        </div>
      </div>



      <Modal open={begModalVisible} closeOnDocumentClick={false} onClose={() => setBegModalVisible(false)}>
        <div className="flex flex-col justify-center items-center mx-5">
          <div className="">Do you want to beg or stand?</div>
          <div className='w-full flex flex-row justify-center gap-5'>
            <Button className='blue-button mt-5' onClick={() => socket.current.emit('begResponse', { ...socketData, response: 'begged' })}>
              Beg
            </Button>

            <Button className='green-button mt-5' onClick={() => socket.current.emit('begResponse', { ...socketData, response: 'stand' })}>
              Stand
            </Button>
          </div>
        </div>
      </Modal>


      <Modal open={begResponseModalVisible} closeOnDocumentClick={false} onClose={() => setBegResponseModalVisible(false)}>
        <div className="flex flex-col justify-center items-center mx-5">
          <div className="">{turnPlayerName} has begged!</div>
          <div className='w-full flex flex-row justify-center gap-5'>
            <Button className='blue-button mt-5' onClick={() => socket.current.emit('begResponse', { ...socketData, response: 'give' })}>
              Give one
            </Button>

            <Button className='green-button mt-5' onClick={() => socket.current.emit('begResponse', { ...socketData, response: 'run' })}>
              Run pack
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={waitingBegResponseModalVisible} closeOnDocumentClick={false} onClose={() => setWaitingBegResponseModalVisible(false)}>
        <div className="flex flex-col justify-center items-center mx-5">
          <div className="">Waiting for response from {dealerName}...</div>
        </div>
      </Modal>

    </div>
  );
}