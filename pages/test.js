import React, { useState, useEffect, useRef } from 'react';
import PlayingCard from "../components/PlayingCard"

export default function FirstPost() {

  // Indicate if the game has been initialised as yet
  const [ loaded, setLoaded ] = useState(false);

  let deckVar; // Cards left in deck
  let kicked; // Card that was kicked
  let liftVar = [-200, 0, 0, 0, 0];

  // React refs for player hand div
  const player1Hand = useRef(null);
  const player2Hand = useRef(null);
  const player3Hand = useRef(null);
  const player4Hand = useRef(null);

  // React states to manage what cards players have
  const [ player1Cards, setPlayer1Cards ] = useState([]);
  const [ player2Cards, setPlayer2Cards ] = useState([]);
  const [ player3Cards, setPlayer3Cards ] = useState([]);
  const [ player4Cards, setPlayer4Cards ] = useState([]);

  // React states to manage what cards players played in a round
  const [ player1CardPlayed, setPlayer1CardPlayed ] = useState("");
  const [ player2CardPlayed, setPlayer2CardPlayed ] = useState("");
  const [ player3CardPlayed, setPlayer3CardPlayed ] = useState("");
  const [ player4CardPlayed, setPlayer4CardPlayed ] = useState("");

  // Manage player hands
  const [ player, setPlayer ] = useState([]);

  // Manage deck of cards
  const [ deck, setDeck ] = useState([]);

  // Manage team scores
  const [ score, setScore ] = useState([0, 0]);

  // Manage kicked card
  const [ kickedCard, setKickedCard ] = useState(null);

  // Manage called card
  const [ called, setCalled ] = useState("any");

  // Manage which suit is trump
  const [ trump, setTrump ] = useState(null);

  // Manage which player is currently the dealer
  const [ dealer, setDealer ] = useState(4);

  // Manage whose turn it is to play
  const [ playerTurn, setPlayerTurn ] = useState(1);

  // Manage cards in a lift
  const [ lift, setLift ] = useState([-200, 0, 0, 0, 0]);

  // Indicate if round ended
  const [ liftEnded, setLiftEnded ] = useState(0);

  // Indicate which team won a lift
  const [ liftWinner, setLiftWinner ] = useState(0);

  // Manage how many players have played in a round
  const [ count, setCount ] = useState(1);

  // Manage each team's points for game
  const [ t1Points, setT1Points ] = useState(0);
  const [ t2Points, setT2Points ] = useState(0);

  // Manage each team's total score
  const [ t1Score, setT1Score ] = useState(0);
  const [ t2Score, setT2Score] = useState(0);

  // Manage values for high, low, game and jack
  const [ high, setHigh ] = useState(0);
  const [ low, setLow ] = useState(15);
  const [ game, setGame ] = useState(0);
  const [ jack, setJack ] = useState(1);

  // Indicate which team played jack
  const [ jackPlayer, setJackPlayer ] = useState(0);

  // Indicate if jack is in the current lift 
  const [ jackInPlay, setJackInPlay ] = useState(false);

  // Indicate which team hung jack
  const [ jackHangerTeam, setJackHangerTeam ] = useState(0);

  // Indicate the power of the card which hung jack
  const [ jackHangerValue, setJackHangerValue ] = useState(0);

  // Manage which team won what point
  const [ gameWinner, setGameWinner ] = useState(0);
  const [ highWinner, setHighWinner ] = useState(0);
  const [ lowWinner, setLowWinner ] = useState(0);
  const [ jackWinner, setJackWinner ] = useState(0);

  // Indicate if player is allowed to beg or not
  const [ letBeg, setLetBeg ] = useState(false);

  // Indicate whether or not to show which team won what
  const [ show, setShow ] = useState(false);

  if (!loaded) {
    
  }

  class Hand {
    constructor() {
      this.cards = [];
      this.canPlay = false;
    }

    setCanPlay() {
      canPlay = true;
    }
  }

  /*
    Create deck of cards
  */
  function createDeck() {
    let suits = ["s", "d", "c", "h"]; // s=Spades, d=Dimes, c=Clubs, h=Hearts
    let values = ["2", "3", "4", "5", "6", "7", "8", "9", "X", "J", "Q", "K", "A"];
    let deck = new Array();
    let card;
    for (var i = 0; i < suits.length; i++) {
      for (var j = 0; j < values.length; j++) {
        card = { Suit: suits[i], Value: values[j] };
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
    for (var i = 0; i < 1000; i++) {
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
  function deal(player, deck) {
    let card;
    let tempPlayer = player;
    let tempDeck = deck;
    let resArray = [];
    for (var i = 0; i < 3; i++) {
      card = tempDeck.pop();
      tempPlayer.cards.push(card);
    }
    setDeck(deck);
    resArray = [tempPlayer, tempDeck];
    return resArray;
  }

  /* 
    Deal 3 cards to all players
  */
  function dealAll(player, deck) {
    let tempPlayer = [];
    let tempDeck = deck;
    let resArray = [];
    for (var j = 0; j < 4; j++) {
      [tempPlayer[j], tempDeck] = deal(player[j], deck);
    }
    setPlayer(tempPlayer);
    resArray = [tempPlayer, tempDeck];
    return resArray;
  }

  /* 
    Use Suit and Value values of a card object to form a string 
  */
  function parseCard(card) {
    let string;
    string = card.Suit + card.Value;
    return string;
  }

  /*
    Render player cards on the screen
  */
  function displayPlayerCards(player, kicked) {
    // Arrays to store player cards as a string
    let p1Cards = [];
    let p2Cards = [];
    let p3Cards = [];
    let p4Cards = [];

    // Only run function once
    
      // For loops to initialise arrays for each player
      for (var i=0; i<player[0].cards.length; i++) {
        p1Cards[i] = player[0].cards[i].Suit + player[0].cards[i].Value;
      }

      for (var i=0; i<player[1].cards.length; i++) {
        p2Cards[i] = player[1].cards[i].Suit + player[1].cards[i].Value;
      }

      for (var i=0; i<player[2].cards.length; i++) {
        p3Cards[i] = player[2].cards[i].Suit + player[2].cards[i].Value;
      }

      for (var i=0; i<player[3].cards.length; i++) {
        p4Cards[i] = player[3].cards[i].Suit + player[3].cards[i].Value;
      }

      setPlayer1Cards(p1Cards);
      setPlayer2Cards(p2Cards);
      setPlayer3Cards(p3Cards);
      setPlayer4Cards(p4Cards);
      setKickedCard(parseCard(kicked));
      setTrump(kicked.Suit);
    

  }

  /*
    Creates card object from card ID
  */
  function getCard(cardId) {
    let suit=cardId.charAt(0);
    let value=cardId.charAt(1);
    var card={Suit: suit, Value: value};
    return card;
  }

  /*
    Check to see what card that the dealer has kicked
  */
  function checkKicked(kicked) {
    let teamScore = [];
    teamScore = [...score];
    if (kicked.Value == 6) {
      if (dealer == 1 || dealer == 3)
        teamScore[0]+=2;
      else
        teamScore[1]+=2;
    }
    if (kicked.Value == "J") {
      if (dealer == 1 || dealer == 3)
        teamScore[0]+=3;
      else
        teamScore[1]+=3;
    }
    if (kicked.Value == "A") {
      if (dealer == 1 || dealer == 3)
        teamScore[0]++;
      else
        teamScore[1]++;
    }
    setScore(teamScore);
  }

  /*
    Get value of card to determine lift winner
  */
  function getCardValue(card) {
    var value=0;
    if (card.Value == "2") {
      value=2;
    }
    else if (card.Value == "3") {
      value=3;
    }
    else if (card.Value == "4") {
      value=4;
    }
    else if (card.Value == "5") {
      value=5;
    }
    else if (card.Value == "6") {
      value=6;
    }
    else if (card.Value == "7") {
      value=7;
    }
    else if (card.Value == "8") {
      value=8;
    }
    else if (card.Value == "9") {
      value=9;
    }
    else if (card.Value == "X") {
      value=10;
    }
    else if (card.Value == "J") {
      value=11;
    }
    else if (card.Value == "Q") {
      value=12;
    }
    else if (card.Value == "K") {
      value=13;
    }
    else if (card.Value == "A") {
      value=14;
    }
    return value;
  }

  /*
    Determine a card's power to win a lift
  */
  function getLift(cardPlayed) {

    let liftTemp = [...lift];
      
    if (cardPlayed.Value === "2") {
      liftTemp[playerTurn] = 2;
    }
    else if (cardPlayed.Value === "3") {
      liftTemp[playerTurn] = 3;
    }
    else if (cardPlayed.Value === "4") {
      liftTemp[playerTurn] = 4;
    }
    else if (cardPlayed.Value === "5") {
      liftTemp[playerTurn] = 5;
    }
    else if (cardPlayed.Value === "6") {
      liftTemp[playerTurn] = 6;
    }
    else if (cardPlayed.Value === "7") {
      liftTemp[playerTurn] = 7;
    }
    else if (cardPlayed.Value === "8") {
      liftTemp[playerTurn] = 8;
    }
    else if (cardPlayed.Value === "9") {
      liftTemp[playerTurn] = 9;
    }
    else if (cardPlayed.Value === "X") {
      liftTemp[playerTurn] = 10;
    }
    else if (cardPlayed.Value === "J") {
      liftTemp[playerTurn] = 11;
    }
    else if (cardPlayed.Value === "Q") {
      liftTemp[playerTurn] = 12;
    }
    else if (cardPlayed.Value === "K") {
      liftTemp[playerTurn] = 13;
    }
    else if (cardPlayed.Value === "A") {
      liftTemp[playerTurn] = 14;
    }
    
    // If card played is trump, their card has more power to win lifts
    if (cardPlayed.Suit == trump) {
      liftTemp[playerTurn] += 100;
    }

    // If card played is not of the suit that was called or trump, their card has less power to win lifts
    if ((cardPlayed.Suit !== called && called !== "any") && cardPlayed.Suit !== trump) {
      liftTemp[playerTurn] = liftTemp[playerTurn] - 100;
    }

    setLift(liftTemp);
    liftVar = liftTemp;
    return liftTemp;
  }

  /*
    Check to see which player won the lift
  */
  function checkLift(lift) {
    let highest=0;
    let highIndex=0;
    for (var i=1; i<5; i++) {
      if (lift[i] > highest) {
        highest=lift[i];
        highIndex=i;
      }
    }
    return highIndex;
  }

  /*
    Calculate how many points for game that the lift winner received
  */
  function getPoints(lift, liftWinner) {
    let points = 0;
    for (var i=1; i<5; i++) {
      if (lift[i] === 10 || lift[i] === 110 || lift[i] === -90) {
        points += 10;
      }
      if (lift[i] === 11 || lift[i] === 111 || lift[i] === -89) {
        points += 1;
      }
      if (lift[i] === 12 || lift[i] === 112 || lift[i] === -88) {
        points += 2;
      }
      if (lift[i] === 13 || lift[i] === 113 || lift[i] === -87) {
        points += 3;
      }
      if (lift[i] === 14 || lift[i] === 114 || lift[i] === -86) {
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
  function undertrump (lift, hand) {
    let trumpPlayed=false;
    var handValue;
    for (var i=0; i<4; i++) {
      if (lift[i] > 100) {
        trumpPlayed = true;
      }
    }
    if (trumpPlayed == false) {
      return false;
    }
    if (hand.charAt(1) === "2") {
      handValue = 102;
    }
    else if (hand.charAt(1) === "3") {
      handValue = 103;
    }
    else if (hand.charAt(1) === "4") {
      handValue = 104;
    }
    else if (hand.charAt(1) === "5") {
      handValue = 105;
    }
    else if (hand.charAt(1) === "6") {
      handValue = 106;
    }
    else if (hand.charAt(1) === "7") {
      handValue = 107;
    }
    else if (hand.charAt(1) === "8") {
      handValue = 108;
    }
    else if (hand.charAt(1) === "9") {
      handValue = 109;
    }
    else if (hand.charAt(1) === "X") {
      handValue = 110;
    }
    else if (hand.charAt(1) === "J") {
      handValue = 111;
    }
    else if (hand.charAt(1) === "Q") {
      handValue = 112;
    }
    else if (hand.charAt(1) === "K") {
      handValue = 113;
    }
    else if (hand.charAt(1) === "A") {
      handValue = 114;
    }
    for (var i=0; i<4; i++) {
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
  function determineJackWinner(jackPlayer, jackWinner) {
    if (jackPlayer == 1 && jackWinner == 1) { // Team 1 won, no hang
      setJack(1);
    }
    else if (jackPlayer == 2 && jackWinner == 2) { //Team 2 won, no hang
      setJack(2);
    }
    else if (jackPlayer == 2 && jackWinner == 1 ) { //Team 1 won, hang
      setJack(3);
    }
    else if (jackPlayer == 1 && jackWinner == 2 ) { //Team 2 won, hang
      setJack(4);
    }
  }

  /*
    Determine score at the end of the round
  */
  function determineScore(gameWinner, highWinner, lowWinner, jack) {
    let tempT1Score = {...t1Score};
    let tempT2Score = {...t2Score};
    let tempScore = [...score];
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

    if (!letBeg) {
      return;
    }

    let kickedVar;
    let tempDeck = [...deck];
    let tempPlayer = [...player];
    
    // Get previously kicked card
    const prevKicked = {...kickedCard};

    // Deal 3 cards to all players
    [tempPlayer, tempDeck] = dealAll(tempPlayer,tempDeck);
    kickedVar = tempDeck.pop();
    checkKicked(kickedVar);

    if (kickedVar.Suit === prevKicked.Suit) {
      [tempPlayer, tempDeck] = dealAll(tempPlayer,tempDeck);
      kickedVar=tempDeck.pop();
      checkKicked(kickedVar);
      if (kickedVar.Suit === prevKicked.Suit) {
        kickedVar=tempDeck.pop();
        checkKicked(kickedVar);
      }
    }
    displayPlayerCards(tempPlayer, kickedVar);
    setDeck(tempDeck);

    // Restrict a player from begging again
    setLetBeg(false);
  }


  /*
    Function that triggers when a card is clicked
  */
  function playCard(event) {
    let team;
    let playerCards;
    let bare = true;
    let cardPlayedId;
    let cardPlayed;
    let liftWinnerVar;
    let playerId;
    let cardHand;
    let points;
    let calledVar = [...called];
    let player1CardsVar = [...player1Cards];
    let player2CardsVar = [...player2Cards];
    let player3CardsVar = [...player3Cards];
    let player4CardsVar = [...player4Cards];
    let jackInPlayVar = {...jackInPlay};
    let jackHangerTeamVar = {...jackHangerTeam};
    let jackHangerValueVar = {...jackHangerValue};
    let jackWinnerVar = {...jackWinner};
    let jackPlayerVar = {...jackPlayer};
    let highWinnerVar = {...highWinner};
    let lowWinnerVar = {...lowWinner};
    let highVar = {...high};
    let lowVar = {...low};
    let undertrumped;
    let gameWinnerVar = {...gameWinner};
    let jackVar;
    let value;

    // Get card played
    cardPlayedId = event.currentTarget.id;
    cardPlayed = getCard(cardPlayedId);
    cardHand = cardPlayedId.charAt(2);

    // If card is being played from a hand that does not belong to the player whose turn it is, end function
    if (cardHand != playerTurn) {
      return;
    }

    // Determine if player attempted to undertrump
    undertrumped = undertrump(lift, cardPlayedId);

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
      playerCards =  [...player2Cards];
    }
    else if (playerTurn == 3) {
      playerCards =  [...player3Cards];
    }
    else {
      playerCards = [...player4Cards];
    }
    
    // Determine if a player does not have a card in the suit of the card that was called
    if (calledVar !== "any") {
      for (var i=0; i<playerCards.length; i++) {
        if (playerCards[i].charAt(0) == calledVar) {
          bare=false;
        } 
      }
    }

    // If the player:
    // * Played a suit that wasn't called,
    // * Wasn't the first player to play for the round,
    // * Has cards in their hand that correspond to the called suit, and
    // * the card played is not trump,
    // then end function and do not add card to lift
    if (cardPlayed.Suit != calledVar && calledVar !== "any" && !bare && cardPlayed.Suit != trump) {
      console.log("Stop");
      return;
    }
    
    // If the player attempted to undertrump, end function and do not add card to lift
    if ((cardPlayed.Suit == trump && undertrumped == true) && calledVar != trump && !bare) {
      console.log("Undertrump");
      return;
    }

    // Restrict the player from being allowed to beg once a card has been played
    setLetBeg(false);

    if (called == "any") { // If trump has not been called yet
      setCalled(cardPlayed.Suit);
      calledVar = cardPlayed.Suit;
      bare = false;
    }
  

    // If trump is played
    if (cardPlayed.Suit == trump) { 
      
      value=getCardValue(cardPlayed);
      if (value > high) {
        setHighWinner(team);
        setHigh(value);
        highVar = value;
        highWinnerVar = team;
      }
      if (value < low) {
        setLowWinner(team);
        setLow(value);
        lowVar = value;
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
        jackHangerValueVar = value;
      }
    }

    // Find card in playerCards array that correspond to the card clicked
    let card = playerCards.findIndex( element => element.charAt(0) === cardPlayed.Suit && element.charAt(1) === cardPlayed.Value);

    // Remove card clicked from array
    playerCards.splice(card, 1);

    // Update states
    if (playerTurn == 1) {
      setPlayer1Cards(playerCards);
      setPlayer1CardPlayed(cardPlayedId);
      player1CardsVar = playerCards;
    }
    else if (playerTurn == 2) {
      setPlayer2Cards(playerCards);
      setPlayer2CardPlayed(cardPlayedId);
      player2CardsVar = playerCards;
    }
    else if (playerTurn == 3) {
      setPlayer3Cards(playerCards);
      setPlayer3CardPlayed(cardPlayedId);
      player3CardsVar = playerCards;
    }
    else {
      setPlayer4Cards(playerCards);
      setPlayer4CardPlayed(cardPlayedId);
      player4CardsVar = playerCards;
    }

    // Put card in lift and determine if card would win or lose lift
    liftVar = getLift(cardPlayed);

    // Increment player turn
    setPlayerTurn(playerTurn+1);

    // Increment count, count determines how many players have played a card for a lift already
    setCount(count+1);

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
      setCalled("any");

      liftWinnerVar=checkLift(liftVar);
      setPlayerTurn(liftWinnerVar);
      setLiftWinner(liftWinnerVar);
      points = getPoints(liftVar, liftWinnerVar);
      setLift([-200, 0, 0 ,0, 0]);
      setLiftEnded(1);
      setPlayer1CardPlayed("");
      setPlayer2CardPlayed("");
      setPlayer3CardPlayed("");
      setPlayer4CardPlayed("");
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
        setDealer(dealer+1);
      }
      else {
        setPlayerTurn(dealer+2);
        setDealer(dealer+1);
      }

      setShow(true);
      setLoaded(false);
    }


  }

  /*
    Initialise game
  */
  useEffect(() => {
    if (!loaded) {
      deckVar = createDeck();
      kicked = deckVar.pop();
      setKickedCard(kicked);
      setDeck(deckVar);
      setLetBeg(true);
      setLoaded(true); // Indicate that player cards have been rendered
      let tempPlayer = [...player];
      let tempDeck = [...deck];

      for (var i = 0; i < 4; i++) {
        tempPlayer[i] = new Hand();
      }

      for (var i = 0; i < 2; i++) {
        [tempPlayer, tempDeck] = dealAll(tempPlayer, deckVar);
      }
      displayPlayerCards(tempPlayer, kicked);
      checkKicked(kicked);
    }
  }, [lift, called, player1Cards, player2Cards, player3Cards, player4Cards]);

  function testFunc(event) {
    let x;
    let card;
    x = player1Cards;
    card = getCard(event.currentTarget.id);
  }

  function testFunc2() {
    setShow(1);
  }

  return (
    <div className="container">
      <h1>Brawl Fours</h1>
      <div className="score row">
        <div className="col-sm-1">
          <p>Score: {score[0]} - {score[1]}</p>
        </div>
        <div className="col-sm-2">
          <p>It is player {playerTurn}'s turn</p>
        </div>
      </div>
      <div className="game">
        <p>Game: {t1Points} - {t2Points}</p>
      </div>
      <div>
        { show ? 
        (
          <p>Team {highWinner} won high with {high}</p>
        ) : (null)
        }
      </div>
      <div>
        { show > 0 ? 
        (
          <p>Team {lowWinner} won low with {low}</p>
        ) : (null)
        }
      </div>
      <div>
        { show > 0 && jackWinner > 0 ? 
        (
          <p>Team {jackWinner} won jack</p>
        ) : (null)
        }
      </div>
      <div>
        { show > 0 && jackWinner != jackPlayer ? 
        (
          <p>Team {jackWinner} hung jack!</p>
        ) : (null)
        }
      </div>
      <div>
        { show > 0 ? 
        (
          <p>Team {lowWinner} won game {t1Points} - {t2Points}</p>
        ) : (null)
        }
      </div>
      <div className="liftWinner">
        { liftWinner > 0 ? 
        (
          <p>Player {liftWinner} won the lift</p>
        ) : (null)
        }
      </div>
      <div className="kicked row">
        <div className="col-sm-2">
          <p> Kicked: </p>
        </div>
        <div className="col-sm-2">
          <p> Player 1 Played: </p>
        </div>
        <div className="col-sm-2">
          <p> Player 2 Played: </p>
        </div>
        <div className="col-sm-2">
          <p> Player 3 Played: </p>
        </div>
        <div className="col-sm-2">
          <p> Player 4 Played: </p>
        </div>
      </div>
      <div className="kickedCard row">
        <PlayingCard value={kickedCard}></PlayingCard>
        <div className="col-sm-1"></div>
        <PlayingCard value={player1CardPlayed}></PlayingCard>
        <div className="col-sm-1"></div>
        <PlayingCard value={player2CardPlayed}></PlayingCard>
        <div className="col-sm-1"></div>
        <PlayingCard value={player3CardPlayed}></PlayingCard>
        <div className="col-sm-1"></div>
        <PlayingCard value={player4CardPlayed}></PlayingCard>
      </div>
      <hr></hr>
      <div className="row hand player1" ref={player1Hand}>
        {
          Array.from({ length: player1Cards.length }, (_, k) => (
            <PlayingCard key={player1Cards[k]} value={player1Cards[k]+1} onClickHandler={playCard}></PlayingCard>
          ))
        }
      </div>
      <div className="row hand player2" ref={player2Hand}>
        {
          Array.from({ length: player2Cards.length }, (_, k) => (
            <PlayingCard key={player2Cards[k]} value={player2Cards[k]+2} onClickHandler={playCard}></PlayingCard>
          ))
        }
      </div>
      <div className="row hand player3" ref={player3Hand}>
        {
          Array.from({ length: player3Cards.length }, (_, k) => (
            <PlayingCard key={player3Cards[k]} value={player3Cards[k]+3} onClickHandler={playCard}></PlayingCard>
          ))
        }
      </div>
      <div className="row hand player4" ref={player4Hand}>
        {
          Array.from({ length: player4Cards.length }, (_, k) => (
            <PlayingCard key={player4Cards[k]} value={player4Cards[k]+4} onClickHandler={playCard}></PlayingCard>
          ))
        }
      </div>
      <button value="Press" onClick={beg}>Press</button>
    </div>
  )
}