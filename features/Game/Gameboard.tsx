import React, { useState, useEffect, useRef, RefObject, useMemo } from 'react';
import io, { Socket } from 'socket.io-client';
import { DeckCard } from '../../models/DeckCard';
import { PlayerHand } from '../../models/PlayerHand';
import PlayingCard from './PlayingCard';
import { useAppSelector } from '../../store/hooks';
import { getDeck, getKickedCards, getPlayerCards, getPlayerList } from '../../slices/game.slice';
import { useRouter } from 'next/router';
import { PlayerData } from '../../models/PlayerData';
import { PlayerSocket } from '../../models/PlayerSocket';

interface Props {
  socket: RefObject<Socket>;
  roomId?: string;
}


export default function Gameboard({ socket, roomId }: Props) {

  const router = useRouter();

  const players = useAppSelector(getPlayerList);

  const deck = useAppSelector(getDeck);

  const kickedCards = useAppSelector(getKickedCards);

  // Cards in the hand of the client player
  const playerCards = useAppSelector(getPlayerCards);

  const socketData = useMemo(() => {
    return ({
      roomId: String(roomId),
    });
  }, [roomId]);

  // Indicate if the game has been initialised as yet
  const [loaded, setLoaded] = useState(false);

  // React refs for player hand div
  const player1Hand = useRef(null);
  const player2Hand = useRef(null);
  const player3Hand = useRef(null);
  const player4Hand = useRef(null);

  // React states to manage what cards players have
  const [player1Cards, setPlayer1Cards] = useState<DeckCard[]>([]);
  const [player2Data, setPlayer2Data] = useState<PlayerData>({});
  const [player3Data, setPlayer3Data] = useState<PlayerData>({});
  const [player4Data, setPlayer4Data] = useState<PlayerData>({});

  // React states to manage what cards players played in a round
  const [player1CardPlayed, setPlayer1CardPlayed] = useState<DeckCard>();
  const [player2CardPlayed, setPlayer2CardPlayed] = useState<DeckCard>();
  const [player3CardPlayed, setPlayer3CardPlayed] = useState<DeckCard>();
  const [player4CardPlayed, setPlayer4CardPlayed] = useState<DeckCard>();

  // Manage player hands
  const [player, setPlayer] = useState<PlayerHand[]>([]);

  // Manage deck of cards
  // const [deck, setDeck] = useState<DeckCard[]>([]); // Cards in deck

  // Manage team scores
  const [score, setScore] = useState<number[]>([0, 0]);

  // Manage kicked card
  const [kickedCard, setKickedCard] = useState<DeckCard[]>();

  // Manage called card
  const [called, setCalled] = useState<DeckCard>();

  // Manage which suit is trump
  const [trump, setTrump] = useState<string>();

  // Manage which player is currently the dealer
  const [dealer, setDealer] = useState<number>(4);

  // Manage whose turn it is to play
  const [playerTurn, setPlayerTurn] = useState<number>(1);

  // Manage cards in a lift
  const [lift, setLift] = useState<number[]>([-200, 0, 0, 0, 0]);

  // Indicate if round ended
  const [liftEnded, setLiftEnded] = useState<number>(0);

  // Indicate which team won a lift
  const [liftWinner, setLiftWinner] = useState<number>(0);

  // Manage how many players have played in a round
  const [count, setCount] = useState<number>(1);

  // Manage each team's points for game
  const [t1Points, setT1Points] = useState<number>(0);
  const [t2Points, setT2Points] = useState<number>(0);

  // Manage each team's total score
  const [t1Score, setT1Score] = useState<number>(0);
  const [t2Score, setT2Score] = useState<number>(0);

  // Manage values for high, low, game and jack
  const [high, setHigh] = useState<number>(0);
  const [low, setLow] = useState<number>(15);
  const [game, setGame] = useState<number>(0);
  const [jack, setJack] = useState<number>(1);

  // Indicate which team played jack
  const [jackPlayer, setJackPlayer] = useState<number>(0);

  // Indicate if jack is in the current lift
  const [jackInPlay, setJackInPlay] = useState<boolean>(false);

  // Indicate which team hung jack
  const [jackHangerTeam, setJackHangerTeam] = useState<number>(0);

  // Indicate the power of the card which hung jack
  const [jackHangerValue, setJackHangerValue] = useState<number>(0);

  // Manage which team won what point
  const [gameWinner, setGameWinner] = useState<number>(0);
  const [highWinner, setHighWinner] = useState<number>(0);
  const [lowWinner, setLowWinner] = useState<number>(0);
  const [jackWinner, setJackWinner] = useState<number>(0);

  // Indicate if player is allowed to beg or not
  const [letBeg, setLetBeg] = useState<boolean>(false);

  // Indicate whether or not to show which team won what
  const [show, setShow] = useState<boolean>(false);

  // Indicate whether or not the game has started
  const [gameStarted, setGameStarted] = useState<boolean>(false);


  /*
    Render player cards on the screen
  */
  function displayPlayerCards(player: DeckCard[], kicked: DeckCard) {

    console.log('Ps: ', player);
    setPlayer1Cards(player);

    console.log('KS: ', kicked);

    setKickedCard([kicked]);
    setTrump(kicked.suit);
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
  useEffect(() => {
    // if (!deck || !kickedCards || deck.length == 0 || kickedCards.length == 0 || loaded) {
    //   return;
    // }

    console.log('Deck: ', deck);
    console.log('Kicked: ', kickedCards);

    socket.current?.emit('playerCards', socketData);

  }, [deck, kickedCards]);

  useEffect(() => {
    if (!kickedCards || !playerCards || kickedCards.length == 0 || playerCards.length == 0) {
      return;
    }

    displayPlayerCards(playerCards, kickedCards[0]);
  }, [playerCards, kickedCards]);

  /*
    Generate deck
  */
  useEffect(() => {
    socket.current?.emit('generateDeck', socketData);
  }, [socketData]);


  useEffect(() => {
    console.log('GPlayers: ', players);

    if (!players || players.length == 0) {
      return;
    }

    // const playerIndex = players.findIndex(el => el.id == socket.current.id);

    const playerNumber = players.find(el => el.id == socket.current.id)?.player;

    const playerDataServer: PlayerSocket[] = [];

    players.forEach((el) => {
      playerDataServer[el.player] = el;
    });

    if (playerNumber == 1) {
      setPlayer2Data({
        numCards: playerDataServer[2].numCards,
        nickname: playerDataServer[2].nickname
      });

      setPlayer3Data({
        numCards: playerDataServer[3].numCards,
        nickname: playerDataServer[3].nickname
      });

      setPlayer4Data({
        numCards: playerDataServer[4].numCards,
        nickname: playerDataServer[4].nickname
      });
    }
    else if (playerNumber == 2) {
      setPlayer2Data({
        numCards: playerDataServer[3].numCards,
        nickname: playerDataServer[3].nickname
      });

      setPlayer3Data({
        numCards: playerDataServer[4].numCards,
        nickname: playerDataServer[4].nickname
      });

      setPlayer4Data({
        numCards: playerDataServer[1].numCards,
        nickname: playerDataServer[1].nickname
      });


    }
    else if (playerNumber == 3) {
      setPlayer2Data({
        numCards: playerDataServer[4].numCards,
        nickname: playerDataServer[4].nickname
      });

      setPlayer3Data({
        numCards: playerDataServer[1].numCards,
        nickname: playerDataServer[1].nickname
      });

      setPlayer4Data({
        numCards: playerDataServer[2].numCards,
        nickname: playerDataServer[2].nickname
      });
    }
    else if (playerNumber == 4) {
      setPlayer2Data({
        numCards: playerDataServer[1].numCards,
        nickname: playerDataServer[1].nickname
      });

      setPlayer3Data({
        numCards: playerDataServer[2].numCards,
        nickname: playerDataServer[2].nickname
      });

      setPlayer4Data({
        numCards: playerDataServer[3].numCards,
        nickname: playerDataServer[3].nickname
      });
    }


  }, [players]);

  useEffect(() => {
    if (!roomId) {
      return;
    }

    socket.current.emit('joinRoom', socketData);
  }, [roomId]);

  return (
    <div className="container">
      <div className="row">
        <div className="col-sm-3 sidepanel">
          <div className="score row">
            <div className="col-sm-12">
              <p>Score: {score[0]} - {score[1]}</p>
            </div>
            <div className="col-sm-12">
              <p>It is player {playerTurn}&apos;s turn</p>
            </div>
          </div>
          <div className="game">
            <p>Game: {t1Points} - {t2Points}</p>
          </div>
          <div>
            {show ?
              (
                <p>Team {highWinner} won high with {high}</p>
              ) : (null)
            }
          </div>
          <div>
            {show ?
              (
                <p>Team {lowWinner} won low with {low}</p>
              ) : (null)
            }
          </div>
          <div>
            {show && jackWinner > 0 ?
              (
                <p>Team {jackWinner} won jack</p>
              ) : (null)
            }
          </div>
          <div>
            {show && jackWinner != jackPlayer ?
              (
                <p>Team {jackWinner} hung jack!</p>
              ) : (null)
            }
          </div>
          <div>
            {show ?
              (
                <p>Team {lowWinner} won game {t1Points} - {t2Points}</p>
              ) : (null)
            }
          </div>
          <div className="liftWinner">
            {liftWinner > 0 ?
              (
                <p>Player {liftWinner} won the lift</p>
              ) : (null)
            }
          </div>
          <div className="kicked">
            <div>
              <p> Kicked: </p>

            </div>
            <button value="Press" onClick={beg}>Press</button>
          </div>
        </div>
        <div className="col-sm-8 cardTable">
          <div className="kickedCard">
            <PlayingCard cardData={kickedCard ? kickedCard[0] : undefined} cardClassName="kicked-1" isKickedCard></PlayingCard>
            <PlayingCard cardData={kickedCard ? kickedCard[1] : undefined} cardClassName="kicked-2" isKickedCard></PlayingCard>
            <PlayingCard cardData={kickedCard ? kickedCard[2] : undefined} cardClassName="kicked-3" isKickedCard></PlayingCard>
            <PlayingCard cardData={kickedCard ? kickedCard[3] : undefined} cardClassName="kicked-4" isKickedCard></PlayingCard>
            <PlayingCard isDeckCard cardClassName="deck"></PlayingCard>
            <PlayingCard cardData={player1CardPlayed} cardClassName="played-1"></PlayingCard>
            <PlayingCard cardData={player2CardPlayed} cardClassName="played-2"></PlayingCard>
            <PlayingCard cardData={player3CardPlayed} cardClassName="played-3"></PlayingCard>
            <PlayingCard cardData={player4CardPlayed} cardClassName="played-4"></PlayingCard>
          </div>
          <div className="hand player1" ref={player1Hand}>

            {
              Array.from({ length: player1Cards.length }, (_, k) => (
                <PlayingCard key={'1' + k} len={player1Cards.length} player={1} iter={k} cardData={player1Cards[k]} onClickHandler={playCard}></PlayingCard>
              ))
            }
          </div>
          <div className="hand player2" ref={player2Hand}>
            <div>Player 2 Name: {player2Data.nickname}</div>
            {
              Array.from({ length: player2Data.numCards }, (_, k) => (
                <PlayingCard key={'2' + k} len={player2Data.numCards} player={2} iter={k} isDeckCard></PlayingCard>
              ))
            }
          </div>
          <div className="hand player3" ref={player3Hand}>
            <div>Player 3 Name: {player3Data.nickname}</div>
            {
              Array.from({ length: player3Data.numCards }, (_, k) => (
                <PlayingCard key={'3' + k} len={player3Data.numCards} player={3} iter={k} isDeckCard></PlayingCard>
              ))
            }
          </div>
          <div className="hand player4" ref={player4Hand}>
            <div>Player 4 Name: {player4Data.nickname}</div>
            {
              Array.from({ length: player4Data.numCards }, (_, k) => (
                <PlayingCard key={'4' + k} len={player4Data.numCards} player={4} iter={k} isDeckCard></PlayingCard>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}