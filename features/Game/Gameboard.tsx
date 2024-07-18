import React, { useState, useEffect, useRef, RefObject, useMemo } from 'react';
import { Socket } from 'socket.io-client';
import { DeckCard } from '../../models/DeckCard';
import PlayingCard from './PlayingCard';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { getBeg, getDealer, getKickedCards, getLift, getMatchWinner, getMessage, getPlayerCards, getPlayerList, getRoundWinners, getTeamScore, getTurn, setMessage } from '../../slices/game.slice';
import { useRouter } from 'next/router';
import { PlayerSocket } from '../../models/PlayerSocket';
import DealerIcon from './StatusIcons/DealerIcon';
import TurnIcon from './StatusIcons/TurnIcon';
import Modal from '../../core/components/Modal';
import Button from '../../core/components/Button';
import { toast } from 'react-toastify';
import GameInfo from './GameInfo';
import { getCardShortcode } from '../../core/services/parseCard';
import RoundWinnersModal from './Modals/RoundWinnersModal';

interface Props {
  socket: RefObject<Socket>;
  roomId?: string;
}


export default function Gameboard({ socket, roomId }: Props) {

  const router = useRouter();

  const dispatch = useAppDispatch();


  const players = useAppSelector(getPlayerList);

  const dealer = useAppSelector(getDealer);

  const playerTurn = useAppSelector(getTurn);

  const begState = useAppSelector(getBeg);

  const message = useAppSelector(getMessage);

  const lift = useAppSelector(getLift);

  const roundWinners = useAppSelector(getRoundWinners);

  const matchWinner = useAppSelector(getMatchWinner);

  // Cards in the hand of the client player
  const playerCards = useAppSelector(getPlayerCards);


  const [begModalVisible, setBegModalVisible] = useState<boolean>(false);
  const [begResponseModalVisible, setBegResponseModalVisible] = useState<boolean>(false);
  const [waitingBegResponseModalVisible, setWaitingBegResponseModalVisible] = useState<boolean>(false);
  const [redealModalVisible, setRedealModalVisible] = useState<boolean>(false);
  const [roundWinnersModalVisible, setRoundWinnersModalVisible] = useState<boolean>(false);




  // React refs for player hand div
  const player1Hand = useRef<HTMLDivElement>(null);
  const player2Hand = useRef<HTMLDivElement>(null);
  const player3Hand = useRef<HTMLDivElement>(null);
  const player4Hand = useRef<HTMLDivElement>(null);

  // React refs for opposing team icons div
  const player2StatusIconsRef = useRef<HTMLDivElement>(null);
  const player4StatusIconsRef = useRef<HTMLDivElement>(null);


  // React states to manage what cards players have
  const [player1Cards, setPlayer1Cards] = useState<DeckCard[]>([]);

  const [player1Data, setPlayer1Data] = useState<PlayerSocket>({});
  const [player2Data, setPlayer2Data] = useState<PlayerSocket>({});
  const [player3Data, setPlayer3Data] = useState<PlayerSocket>({});
  const [player4Data, setPlayer4Data] = useState<PlayerSocket>({});

  // Data to send to socket
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

  // Get data of player whose turn it is
  const turnPlayerData = useMemo(() => {
    return players.find(el => el.player == playerTurn);
  }, [playerTurn, players]);


  // Get data of dealer
  const dealerData = useMemo(() => {
    return players.find(el => el.player == dealer);
  }, [dealer, players]);

  // Lift cards
  const player1CardPlayed = useMemo(() => {
    if (!lift) {
      return undefined;
    }

    return lift.find(el => el.player == playerNumber);
  }, [lift]);

  const player2CardPlayed = useMemo(() => {
    if (!lift || !playerNumber) {
      return undefined;
    }

    const player2Number = playerNumber == 4 ? 1 : playerNumber + 1;

    return lift.find(el => el.player == player2Number);

  }, [lift, playerNumber]);

  const player3CardPlayed = useMemo(() => {
    if (!lift) {
      return undefined;
    }

    const player3Number = playerNumber + 2 > 4 ? (playerNumber + 2) % 4 : playerNumber + 2;

    return lift.find(el => el.player == player3Number);


  }, [lift]);

  const player4CardPlayed = useMemo(() => {
    if (!lift) {
      return undefined;
    }

    const player4Number = playerNumber + 3 > 4 ? (playerNumber + 3) % 4 : playerNumber + 3;

    return lift.find(el => el.player == player4Number);

  }, [lift]);


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


  function playCard(card: DeckCard) {
    console.log('Card clicked: ', card);

    if (!isPlayer1Turn) {
      return;
    }

    socket.current?.emit('playCard', { ...socketData, card: card, player: playerNumber });
  }

  useEffect(() => {
    displayPlayerCards(playerCards ?? []);
  }, [playerCards]);

  /*
    Initialise game
  */
  useEffect(() => {
    socket.current?.emit('initialiseGame', socketData);
  }, [socketData]);


  /*
    Set player data
  */
  useEffect(() => {

    if (!players || players.length == 0) {
      return;
    }

    const playerDataServer: PlayerSocket[] = [];

    players.forEach((el) => {
      playerDataServer[el.player] = el;
    });

    setPlayer1Data(playerDataServer[playerNumber]);

    if (playerNumber == 1) {
      setPlayer2Data(playerDataServer[2]);

      setPlayer3Data(playerDataServer[3]);

      setPlayer4Data(playerDataServer[4]);
    }
    else if (playerNumber == 2) {
      setPlayer2Data(playerDataServer[3]);

      setPlayer3Data(playerDataServer[4]);

      setPlayer4Data(playerDataServer[1]);
    }
    else if (playerNumber == 3) {
      setPlayer2Data(playerDataServer[4]);

      setPlayer3Data(playerDataServer[1]);

      setPlayer4Data(playerDataServer[2]);
    }
    else if (playerNumber == 4) {
      setPlayer2Data(playerDataServer[1]);

      setPlayer3Data(playerDataServer[2]);

      setPlayer4Data(playerDataServer[3]);
    }

  }, [players, playerNumber]);

  useEffect(() => {
    if (roundWinners) {
      setRoundWinnersModalVisible(true);
    }
  }, [roundWinners]);

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
    }
    else if (begState == 'stand') {
      setBegModalVisible(false);
    }
    else if (begState == 'give') {
      setBegResponseModalVisible(false);
      setWaitingBegResponseModalVisible(false);
    }
    else if (begState == 'run') {
      setBegResponseModalVisible(false);
      setWaitingBegResponseModalVisible(false);
    }
    else if (begState == 'begging') {
      setRedealModalVisible(false);

      if (isPlayer1Turn) {
        setBegModalVisible(true);
      }
    }
  }, [begState, isPlayer1Dealer, isPlayer1Turn, turnPlayerData, dealerData]);

  useEffect(() => {
    if (!roomId) {
      return;
    }

    socket.current.emit('joinRoom', socketData);
  }, [roomId]);

  useEffect(() => {
    if (message) {
      if (isPlayer1Dealer && message.shortcode == 'REDEAL') {
        setRedealModalVisible(true);
      }
      else if (
        isPlayer1Dealer && message.shortcode == 'GIVE'
        || (isPlayer1Turn || isPlayer1Dealer) && message.shortcode == 'BEGGED'
        || isPlayer1Dealer && message.shortcode == 'RUN'
      ) {
        //
      }
      else {
        toast(message.message, {
          type: 'default',
          hideProgressBar: true,
          position: 'top-center'
        });
      }

      dispatch(setMessage(undefined));
    }
  }, [message, isPlayer1Dealer, isPlayer1Turn]);

  useEffect(() => {
    if (matchWinner) {
      router.push({
        pathname: '/',
        query: {
          roomId: roomId
        }
      });
    }
  }, [matchWinner]);



  return (
    <div className="h-screen w-screen bg-slate-300">

      <div className='flex flex-row'>

        <GameInfo playerTurn={playerTurn} playerTeam={player1Data.team} />

        <div className="h-screen w-4/5">


          {/* ------------------------ Player 3 Info  ------------------------*/}
          <div className='h-[25vh] flex flex-col justify-between'>
            <div className='flex flex-col items-center justify-center p-3'>
              <div className='flex justify-center'>
                {
                  player3Data.nickname
                }
              </div>

              <div className='flex flex-row gap-2'>
                <DealerIcon active={dealerData && player3Data.id == dealerData.id} />
                <TurnIcon active={turnPlayerData && player3Data.id == turnPlayerData.id} />
              </div>
            </div>

            <div className="w-full flex flex-row justify-center" ref={player3Hand}>
              {
                Array.from({ length: player3Data.numCards }, (_, k) => (
                  <PlayingCard
                    key={'3' + k}
                    player={3}
                    isDeckCard
                    className='-mx-2 p-0'
                  />
                ))
              }
            </div>
          </div>
          {/* -----------------------------------------------------------------*/}




          <div className='flex flex-row'>
            {/* ------------------------ Player 4 Info  ------------------------*/}
            <div className='flex flex-col justify-center items-center w-2/12'>
              <div >
                {
                  player4Data.nickname
                }
              </div>

              <div className={`grid gap-2 ${getTeam2GridCols(player4StatusIconsRef)}`} ref={player4StatusIconsRef}>
                <DealerIcon active={dealerData && player4Data.id == dealerData.id} />
                <TurnIcon active={turnPlayerData && player4Data.id == turnPlayerData.id} />
              </div>
            </div>

            <div className="w-1/6 h-[50vh] flex flex-col items-center justify-center gap-0" ref={player2Hand}>
              {
                Array.from({ length: player4Data.numCards }, (_, k) => (
                  <PlayingCard
                    key={'4' + k}
                    player={4}
                    isDeckCard
                    className='rotate-90 p-0'
                    style={getTeam2CardMargins(player4Data.numCards)}
                  />
                ))
              }
            </div>
            {/* -----------------------------------------------------------------*/}





            {/* ------------------------ Lift Info  ------------------------*/}
            <div className='w-4/6 flex flex-col gap-2 items-center justify-center'>

              <PlayingCard cardData={player3CardPlayed} isOutline></PlayingCard>

              <div className='flex flex-row gap-32'>
                <PlayingCard cardData={player4CardPlayed} isOutline></PlayingCard>
                <PlayingCard cardData={player2CardPlayed} isOutline></PlayingCard>
              </div>

              <PlayingCard cardData={player1CardPlayed} isOutline></PlayingCard>

            </div>
            {/* -------------------------------------------------------------*/}





            {/* ------------------------ Player 2 Info  ------------------------*/}
            <div className="w-1/6 h-[50vh] flex flex-col items-center justify-center gap-0" ref={player4Hand}>
              {
                Array.from({ length: player2Data.numCards }, (_, k) => (
                  <PlayingCard
                    key={'2' + k}
                    player={2}
                    isDeckCard
                    className='rotate-90 p-0'
                    style={getTeam2CardMargins(player2Data.numCards)}
                  />
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
                <DealerIcon active={dealerData && player2Data.id == dealerData.id} />
                <TurnIcon active={turnPlayerData && player2Data.id == turnPlayerData.id} />
              </div>
            </div>
            {/* -----------------------------------------------------------------*/}
          </div>






          {/* ------------------------ Player 1 Info  ------------------------*/}
          <div className='h-[25vh]'>
            <div className="w-full flex flex-row justify-center" ref={player1Hand}>
              {
                Array.from({ length: player1Cards.length == 0 ? player1Data.numCards : player1Cards.length}, (_, k) => (
                  <PlayingCard
                    key={'1' + k}
                    player={1}
                    cardData={player1Cards[k]}
                    isDeckCard={player1Cards.length == 0 ? true : false}
                    onClickHandler={() => player1Cards.length == 0 ? undefined : playCard(player1Cards[k])}
                    className='-mx-2' />
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
                <DealerIcon active={dealerData && player1Data.id == dealerData.id}/>
                <TurnIcon active={turnPlayerData && player1Data.id == turnPlayerData.id} />
              </div>

            </div>
          </div>
          {/* -----------------------------------------------------------------*/}

        </div>
      </div>


      {/* ------------------------ Modals ------------------------*/}
      <RoundWinnersModal isVisible={roundWinnersModalVisible} setIsVisible={setRoundWinnersModalVisible} players={players} roundWinners={roundWinners} />

      <Modal open={begModalVisible && !roundWinnersModalVisible} closeOnDocumentClick={false} onClose={() => setBegModalVisible(false)}>
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
          <div className="">{turnPlayerData?.nickname} has begged!</div>
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
          <div className="">Waiting for response from {dealerData?.nickname}...</div>
        </div>
      </Modal>

      <Modal open={redealModalVisible} closeOnDocumentClick={false} onClose={() => setBegResponseModalVisible(false)}>
        <div className="flex flex-col justify-center items-center mx-5">
          <div className="">The deck has run out of cards and must be redealt!</div>
          <div className='w-full flex flex-row justify-center gap-5'>
            <Button className='blue-button mt-5' onClick={() => socket.current.emit('redeal', socketData)}>
              Redeal
            </Button>
          </div>
        </div>
      </Modal>


      {/* -----------------------------------------------------------*/}

    </div>
  );
}