import React, { useState, useEffect, useRef, RefObject, useMemo } from 'react';
import io, { Socket } from 'socket.io-client';
import { DeckCard } from '../../models/DeckCard';
import { PlayerHand } from '../../models/PlayerHand';
import PlayingCard from './PlayingCard';
import { useAppSelector } from '../../store/hooks';
import { getDeck, getKickedCards, getPlayerCards, getPlayerList } from '../../slices/game.slice';

interface Props {
  socket: RefObject<Socket>;
  roomId?: string;
}


export default function Gameboard({ socket, roomId }: Props) {

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
  const [player2Cards, setPlayer2Cards] = useState<DeckCard[]>([]);
  const [player3Cards, setPlayer3Cards] = useState<DeckCard[]>([]);
  const [player4Cards, setPlayer4Cards] = useState<DeckCard[]>([]);

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
    Create deck of cards
  */
  function createDeck() {
    const suits = ['s', 'd', 'c', 'h']; // s=Spades, d=Dimes, c=Clubs, h=Hearts
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', 'X', 'J', 'Q', 'K', 'A'];
    const deck: DeckCard[] = [];
    let card;
    for (let i = 0; i < suits.length; i++) {
      for (let j = 0; j < values.length; j++) {
        card = { suit: suits[i], value: values[j] };
        deck.push(card);
      }
    }
    shuffle(deck);
    return deck;
  }

  /*
    Shuffle deck
  */
  function shuffle(deck) {
    let loc1;
    let loc2;
    let temp;
    for (let i = 0; i < 1000; i++) {
      loc1 = Math.floor((Math.random() * deck.length));
      loc2 = Math.floor((Math.random() * deck.length));
      temp = deck[loc1];
      deck[loc1] = deck[loc2];
      deck[loc2] = temp;
    }
  }

  /*
    Deal 3 cards to a player
  */
  function deal(player: PlayerHand, deck: DeckCard[]) {
    let card: DeckCard | undefined;
    const tempPlayer: PlayerHand = player;
    const tempDeck: DeckCard[] = deck;

    for (let i = 0; i < 3; i++) {
      card = tempDeck.pop();

      if (card) {
        tempPlayer.cards.push(card);
      }
    }

    return {
      hand: tempPlayer,
      deck: tempDeck
    };
  }

  /*
    Deal 3 cards to all players
  */
  function dealAll(player: PlayerHand[], deck: DeckCard[]) {
    const tempPlayer: PlayerHand[] = [];
    let tempDeck: DeckCard[] = deck;

    for (let j = 0; j < 4; j++) {
      const resp = deal(player[j], tempDeck);

      tempPlayer[j] = resp.hand;
      tempDeck = resp.deck;
    }

    setPlayer(tempPlayer);
    setDeck(tempDeck);

    return {
      playerHands: tempPlayer,
      deck: tempDeck
    };
  }


  /*
    Render player cards on the screen
  */
  function displayPlayerCards(player: PlayerHand[], kicked: DeckCard) {
    // Arrays to store player cards as a string
    const p1Cards: DeckCard[] = [];
    const p2Cards: DeckCard[] = [];
    const p3Cards: DeckCard[] = [];
    const p4Cards: DeckCard[] = [];

    // Only run function once

    // For loops to initialise arrays for each player
    for (let i = 0; i < player[0].cards.length; i++) {
      p1Cards[i] = player[0].cards[i];
    }

    for (let i = 0; i < player[1].cards.length; i++) {
      p2Cards[i] = player[1].cards[i];
    }

    for (let i = 0; i < player[2].cards.length; i++) {
      p3Cards[i] = player[2].cards[i];
    }

    for (let i = 0; i < player[3].cards.length; i++) {
      p4Cards[i] = player[3].cards[i];
    }

    setPlayer1Cards(p1Cards);
    setPlayer2Cards(p2Cards);
    setPlayer3Cards(p3Cards);
    setPlayer4Cards(p4Cards);

    setKickedCard([kicked]);
    setTrump(kicked.suit);
  }


  /*
    Check to see what card that the dealer has kicked
  */
  function checkKicked(kicked: DeckCard, tempScore: number[]) {
    const teamScore = tempScore;

    if (kicked.value == '6') {
      if (dealer == 1 || dealer == 3)
        teamScore[0] += 2;
      else
        teamScore[1] += 2;
    }
    if (kicked.value == 'J') {
      if (dealer == 1 || dealer == 3)
        teamScore[0] += 3;
      else
        teamScore[1] += 3;
    }
    if (kicked.value == 'A') {
      if (dealer == 1 || dealer == 3)
        teamScore[0]++;
      else
        teamScore[1]++;
    }

    setScore(teamScore);
    return teamScore;
  }

  /*
    Get value of card to determine lift winner
  */
  function getCardValue(card?: DeckCard) {
    let value = 0;
    if (card?.value == '2') {
      value = 2;
    }
    else if (card?.value == '3') {
      value = 3;
    }
    else if (card?.value == '4') {
      value = 4;
    }
    else if (card?.value == '5') {
      value = 5;
    }
    else if (card?.value == '6') {
      value = 6;
    }
    else if (card?.value == '7') {
      value = 7;
    }
    else if (card?.value == '8') {
      value = 8;
    }
    else if (card?.value == '9') {
      value = 9;
    }
    else if (card?.value == 'X') {
      value = 10;
    }
    else if (card?.value == 'J') {
      value = 11;
    }
    else if (card?.value == 'Q') {
      value = 12;
    }
    else if (card?.value == 'K') {
      value = 13;
    }
    else if (card?.value == 'A') {
      value = 14;
    }
    return value;
  }

  /*
    Determine a card's power to win a lift
  */
  function getLift(cardPlayed?: DeckCard) {

    const liftTemp = [...lift];

    if (cardPlayed?.value === '2') {
      liftTemp[playerTurn] = 2;
    }
    else if (cardPlayed?.value === '3') {
      liftTemp[playerTurn] = 3;
    }
    else if (cardPlayed?.value === '4') {
      liftTemp[playerTurn] = 4;
    }
    else if (cardPlayed?.value === '5') {
      liftTemp[playerTurn] = 5;
    }
    else if (cardPlayed?.value === '6') {
      liftTemp[playerTurn] = 6;
    }
    else if (cardPlayed?.value === '7') {
      liftTemp[playerTurn] = 7;
    }
    else if (cardPlayed?.value === '8') {
      liftTemp[playerTurn] = 8;
    }
    else if (cardPlayed?.value === '9') {
      liftTemp[playerTurn] = 9;
    }
    else if (cardPlayed?.value === 'X') {
      liftTemp[playerTurn] = 10;
    }
    else if (cardPlayed?.value === 'J') {
      liftTemp[playerTurn] = 11;
    }
    else if (cardPlayed?.value === 'Q') {
      liftTemp[playerTurn] = 12;
    }
    else if (cardPlayed?.value === 'K') {
      liftTemp[playerTurn] = 13;
    }
    else if (cardPlayed?.value === 'A') {
      liftTemp[playerTurn] = 14;
    }

    // If card played is trump, their card has more power to win lifts
    if (cardPlayed?.suit == trump) {
      liftTemp[playerTurn] += 100;
    }

    // If card played is not of the suit that was called or trump, their card has less power to win lifts
    if ((called && cardPlayed?.suit != called.suit) && cardPlayed?.suit != trump) {
      liftTemp[playerTurn] = liftTemp[playerTurn] - 100;
    }

    setLift(liftTemp);
    return liftTemp;
  }

  /*
    Check to see which player won the lift
  */
  function checkLift(lift: number[]) {
    let highest = 0;
    let highIndex = 0;
    for (let i = 1; i < 5; i++) {
      if (lift[i] > highest) {
        highest = lift[i];
        highIndex = i;
      }
    }
    return highIndex;
  }

  /*
    Calculate how many points for game that the lift winner received
  */
  function getPoints(lift: number[], liftWinner: number) {
    let points = 0;
    for (let i = 1; i < 5; i++) {
      if (lift[i] == 10 || lift[i] == 110 || lift[i] == -90) {
        points += 10;
      }
      if (lift[i] == 11 || lift[i] == 111 || lift[i] == -89) {
        points += 1;
      }
      if (lift[i] == 12 || lift[i] == 112 || lift[i] == -88) {
        points += 2;
      }
      if (lift[i] == 13 || lift[i] == 113 || lift[i] == -87) {
        points += 3;
      }
      if (lift[i] == 14 || lift[i] == 114 || lift[i] == -86) {
        points += 4;
      }
    }
    if (liftWinner == 1 || liftWinner == 3) {
      setT1Points(t1Points + points);
    }
    else {
      setT2Points(t2Points + points);
    }
    return points;
  }

  /*
    Determine whether or not a player tried to undertrump
  */
  function didUndertrump(hand?: DeckCard) {
    let trumpPlayed = false;
    let handValue;
    for (let i = 0; i < 4; i++) {
      if (lift[i] > 100) {
        trumpPlayed = true;
      }
    }
    if (trumpPlayed == false) {
      return false;
    }
    if (hand?.value == '2') {
      handValue = 102;
    }
    else if (hand?.value == '3') {
      handValue = 103;
    }
    else if (hand?.value == '4') {
      handValue = 104;
    }
    else if (hand?.value == '5') {
      handValue = 105;
    }
    else if (hand?.value == '6') {
      handValue = 106;
    }
    else if (hand?.value == '7') {
      handValue = 107;
    }
    else if (hand?.value == '8') {
      handValue = 108;
    }
    else if (hand?.value == '9') {
      handValue = 109;
    }
    else if (hand?.value == 'X') {
      handValue = 110;
    }
    else if (hand?.value == 'J') {
      handValue = 111;
    }
    else if (hand?.value == 'Q') {
      handValue = 112;
    }
    else if (hand?.value == 'K') {
      handValue = 113;
    }
    else if (hand?.value == 'A') {
      handValue = 114;
    }
    for (let i = 0; i < 4; i++) {
      if (lift[i] > handValue) {
        return true;
      }
    }
    return false;
  }

  /*
    Determine which team won game
  */
  function determineGame() {
    if (t1Points > t2Points) {
      return 1;
    }
    else {
      return 2;
    }
  }

  /*
    Determines which team won jack
  */
  function determineJackWinner(jackPlayer: number, jackWinner: number) {
    if (jackPlayer == 1 && jackWinner == 1) { // Team 1 won, no hang
      setJack(1);
      return 1;
    }
    else if (jackPlayer == 2 && jackWinner == 2) { //Team 2 won, no hang
      setJack(2);
      return 2;
    }
    else if (jackPlayer == 2 && jackWinner == 1) { //Team 1 won, hang
      setJack(3);
      return 3;
    }
    else if (jackPlayer == 1 && jackWinner == 2) { //Team 2 won, hang
      setJack(4);
      return 4;
    }

    return 5;
  }

  /*
    Determine score at the end of the round
  */
  function determineScore(gameWinner: number, highWinner: number, lowWinner: number, jack: number) {
    const tempT1Score = t1Score;
    const tempT2Score = t2Score;
    const tempScore = [...score];
    if (gameWinner == 1) {
      tempScore[0] += 1;
    }
    else {
      tempScore[1] += 1;
    }
    if (highWinner == 1) {
      tempScore[0] += 1;
    }
    else {
      tempScore[1] += 1;
    }
    if (lowWinner == 1) {
      tempScore[0] += 1;
    }
    else {
      tempScore[1] += 1;
    }
    if (jack == 1) {
      tempScore[0] += 1;
    }
    else if (jack == 2) {
      tempScore[1] += 1;
    }
    else if (jack == 3) {
      tempScore[0] += 3;
    }
    else if (jack == 4) {
      tempScore[1] += 3;
    }
    setT1Score(tempT1Score);
    setT2Score(tempT2Score);
    setScore(tempScore);
  }

  /*
    Function that deals additional cards when a player begs
  */
  function beg() {

    if (!letBeg || !kickedCard) {
      return;
    }

    let kickedVar: DeckCard | undefined;
    let tempDeck: DeckCard[] = [...deck];
    let tempPlayer: PlayerHand[] = [...player];
    let tempScore: number[] = [...score];

    // Get previously kicked card
    const kickedCardVar = [...kickedCard];
    const prevKicked = kickedCardVar[0];

    console.log('KC: ' + kickedCardVar[0]);

    // Deal 3 cards to all players
    const resp = dealAll(tempPlayer, tempDeck);

    tempPlayer = resp.playerHands;
    tempDeck = resp.deck;

    kickedVar = tempDeck.pop();

    if (!kickedVar) {
      console.error('Undefined kick');
      return;
    }

    kickedCardVar.push(kickedVar);

    tempScore = checkKicked(kickedVar, tempScore);


    if (kickedVar.suit === prevKicked.suit) {
      const resp2 = dealAll(tempPlayer, tempDeck);

      tempPlayer = resp2.playerHands;
      tempDeck = resp2.deck;

      kickedVar = tempDeck.pop();

      if (!kickedVar) {
        console.error('Undefined kick');
        return;
      }

      kickedCardVar.push(kickedVar);

      tempScore = checkKicked(kickedVar, tempScore);

      if (kickedVar.suit === prevKicked.suit) {
        kickedVar = tempDeck.pop();

        if (!kickedVar) {
          console.error('Undefined kick');
          return;
        }

        kickedCardVar.push(kickedVar);

        tempScore = checkKicked(kickedVar, tempScore);
      }
    }
    displayPlayerCards(tempPlayer, kickedVar);
    setDeck(tempDeck);
    setKickedCard(kickedCardVar);

    // Restrict a player from begging again
    setLetBeg(false);

  }


  /*
    Function that triggers when a card is clicked
  */
  function playCard(cardPlayed?: DeckCard, cardHand?: number) {
    let team: number;
    let playerCards: DeckCard[];
    let bare = true;
    let liftWinnerVar: number;

    let calledVar: DeckCard | undefined = called;
    let player1CardsVar: DeckCard[] = [...player1Cards];
    let player2CardsVar: DeckCard[] = [...player2Cards];
    let player3CardsVar: DeckCard[] = [...player3Cards];
    let player4CardsVar: DeckCard[] = [...player4Cards];
    let jackInPlayVar: boolean = jackInPlay;
    let jackHangerTeamVar: number = jackHangerTeam;
    let jackWinnerVar: number = jackWinner;
    let jackPlayerVar: number = jackPlayer;
    let highWinnerVar: number = highWinner;
    let lowWinnerVar: number = lowWinner;
    let gameWinnerVar: number = gameWinner;
    let jackVar: number;
    let value: number;

    // If card is being played from a hand that does not belong to the player whose turn it is, end function
    if (cardHand != playerTurn) {
      return;
    }

    // Determine if player attempted to undertrump
    const undertrumped = didUndertrump(cardPlayed);

    // Determine which team the player is on
    if (playerTurn == 1 || playerTurn == 3) {
      team = 1;
    }
    else {
      team = 2;
    }

    // Get cards of the player whose turn it is
    if (playerTurn == 1) {
      playerCards = [...player1Cards];
    }
    else if (playerTurn == 2) {
      playerCards = [...player2Cards];
    }
    else if (playerTurn == 3) {
      playerCards = [...player3Cards];
    }
    else {
      playerCards = [...player4Cards];
    }

    // Determine if a player does not have a card in the suit of the card that was called
    if (calledVar) {
      for (let i = 0; i < playerCards.length; i++) {
        if (playerCards[i].suit == calledVar.suit) {
          bare = false;
        }
      }
    }

    // If the player:
    // * Played a suit that wasn't called,
    // * Wasn't the first player to play for the round,
    // * Has cards in their hand that correspond to the called suit, and
    // * the card played is not trump,
    // then end function and do not add card to lift
    if (cardPlayed?.suit != calledVar?.suit && calledVar && !bare && cardPlayed?.suit != trump) {
      console.log('Stop');
      return;
    }

    // If the player attempted to undertrump, end function and do not add card to lift
    if ((cardPlayed?.suit == trump && undertrumped == true) && calledVar?.suit != trump && !bare) {
      console.log('Undertrump');
      return;
    }

    // Restrict the player from being allowed to beg once a card has been played
    setLetBeg(false);

    if (!called) { // If trump has not been called yet
      setCalled(cardPlayed);
      calledVar = cardPlayed;
      bare = false;
    }


    // If trump is played
    if (cardPlayed?.suit == trump) {

      value = getCardValue(cardPlayed);
      if (value > high) {
        setHighWinner(team);
        setHigh(value);
        highWinnerVar = team;
      }
      if (value < low) {
        setLowWinner(team);
        setLow(value);
        lowWinnerVar = team;
      }
      if (value == 11 && jackPlayer == 0) { //If jack has not yet been played
        setJackPlayer(team);
        setJackWinner(team);
        setJackInPlay(true);
        jackPlayerVar = team;
        jackWinnerVar = team;
        jackInPlayVar = true;
      }
      if (value > 11 && jackInPlay == true) { // If jack is in lift and a Queen or higher has been played
        setJackWinner(team);
        jackWinnerVar = team;
      }
      if (value > 11 && value > jackHangerValue) { // If jack is in lift with a Queen or higher and a Card stronger than the previous royal is played
        setJackHangerTeam(team);
        setJackHangerValue(value);
        jackHangerTeamVar = team;
      }
    }

    // Find card in playerCards array that correspond to the card clicked
    const card = playerCards.findIndex(element => element.suit === cardPlayed?.suit && element.value === cardPlayed?.value);

    // Remove card clicked from array
    playerCards.splice(card, 1);

    // Update states
    if (playerTurn == 1) {
      setPlayer1Cards(playerCards);
      setPlayer1CardPlayed(cardPlayed);
      player1CardsVar = playerCards;
    }
    else if (playerTurn == 2) {
      setPlayer2Cards(playerCards);
      setPlayer2CardPlayed(cardPlayed);
      player2CardsVar = playerCards;
    }
    else if (playerTurn == 3) {
      setPlayer3Cards(playerCards);
      setPlayer3CardPlayed(cardPlayed);
      player3CardsVar = playerCards;
    }
    else {
      setPlayer4Cards(playerCards);
      setPlayer4CardPlayed(cardPlayed);
      player4CardsVar = playerCards;
    }

    // Put card in lift and determine if card would win or lose lift
    const liftVar = getLift(cardPlayed);

    // Increment player turn
    setPlayerTurn(playerTurn + 1);

    // Increment count, count determines how many players have played a card for a lift already
    setCount(count + 1);

    // Loop back to player 1 after player 4 has played
    if (playerTurn == 4) {
      setPlayerTurn(1);
    }

    // Lift end
    if (count == 4) {
      setCount(1);

      // Set the team who hung jack as the jack winner
      if (jackHangerTeamVar > 0 && jackInPlayVar) {
        setJackWinner(jackHangerTeamVar);
      }
      setJackHangerTeam(0);
      setJackHangerValue(0);
      setJackInPlay(false);
      setCalled(undefined);

      liftWinnerVar = checkLift(liftVar);
      setPlayerTurn(liftWinnerVar);
      setLiftWinner(liftWinnerVar);
      getPoints(liftVar, liftWinnerVar);
      setLift([-200, 0, 0, 0, 0]);
      setLiftEnded(1);
      setPlayer1CardPlayed(undefined);
      setPlayer2CardPlayed(undefined);
      setPlayer3CardPlayed(undefined);
      setPlayer4CardPlayed(undefined);
    }

    // When all players are out of cards

    if (player1CardsVar.length == 0 && player2CardsVar.length == 0 && player3CardsVar.length == 0 && player4CardsVar.length == 0) {
      gameWinnerVar = determineGame();
      jackVar = determineJackWinner(jackPlayerVar, jackWinnerVar);
      determineScore(gameWinnerVar, highWinnerVar, lowWinnerVar, jackVar);

      // Reset variables
      setT1Points(0);
      setT2Points(0);
      setHigh(0);
      setLow(15);
      setHighWinner(0);
      setLowWinner(0);
      setJackWinner(0);
      setJackPlayer(0);
      setJack(0);

      if (dealer == 4) {
        setDealer(1);
        setPlayerTurn(2);
      }
      else if (dealer == 3) {
        setPlayerTurn(1);
        setDealer(dealer + 1);
      }
      else {
        setPlayerTurn(dealer + 2);
        setDealer(dealer + 1);
      }

      setShow(true);
      setLoaded(false);
    }


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

    // let tempScore: number[] = [...score];

    // const deckVar = deck;

    // setLetBeg(true);
    // setLoaded(true); // Indicate that player cards have been rendered
    // let tempPlayer = [...player];
    // let tempDeck = [...deck];

    // for (let i = 0; i < 4; i++) {
    //   tempPlayer[i] = {
    //     canPlay: false,
    //     cards: []
    //   } as PlayerHand;
    // }

    // for (let i = 0; i < 2; i++) {
    //   const resp = dealAll(tempPlayer, deckVar);
    //   tempPlayer = resp.playerHands;
    //   tempDeck = resp.deck;
    // }
    // displayPlayerCards(tempPlayer, kickedCards[0]);
    // console.log('K: ' + kickedCards[0].suit);
    // tempScore = checkKicked(kickedCards[0], tempScore);

  }, [deck, kickedCards]);

  useEffect(() => {
    console.log('Player Cards: ', playerCards);
  }, [playerCards]);


  /*
    Generate deck
  */
  useEffect(() => {
    socket.current?.emit('generateDeck', socketData);
  }, [socketData]);

  useEffect(() => {
    console.log('GPlayers: ', players);
  }, [players]);

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
            {
              Array.from({ length: player2Cards.length }, (_, k) => (
                <PlayingCard key={'2' + k} len={player2Cards.length} player={2} iter={k} cardData={player2Cards[k]} onClickHandler={playCard}></PlayingCard>
              ))
            }
          </div>
          <div className="hand player3" ref={player3Hand}>
            {
              Array.from({ length: player3Cards.length }, (_, k) => (
                <PlayingCard key={'3' + k} len={player3Cards.length} player={3} iter={k} cardData={player3Cards[k]} onClickHandler={playCard}></PlayingCard>
              ))
            }
          </div>
          <div className="hand player4" ref={player4Hand}>
            {
              Array.from({ length: player4Cards.length }, (_, k) => (
                <PlayingCard key={'4' + k} len={player4Cards.length} player={4} iter={k} cardData={player4Cards[k]} onClickHandler={playCard}></PlayingCard>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}