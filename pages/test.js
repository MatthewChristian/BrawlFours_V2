import React, { useState, useEffect, useRef } from 'react';
import PlayingCard from "../components/PlayingCard"


export default function FirstPost() {

  // Indicate if the game has been initialised as yet
  const [ loaded, setLoaded ] = useState(false);

  let player; // Array to store cards in all players' hands
  let deck; // Cards left in deck
  let kicked; // Card that was kicked
  let dealer; // Which player is the dealer
  let player1CardsVar; // Cards in player 1's hand
  let player2CardsVar;
  let player3CardsVar;
  let player4CardsVar;
  let playerTurnVar = 1; // Which player's turn to play
  let called = "any"; // Which card was called
  let high = 0;
  let highWinner = 0; // Team who won high
  let low = 0;
  let lowWinner = 0; // Team who won low
  let jack = 0; // Jack value
  let jackPlayer = 0; // Team who played jack
  let jackWinner = 0; // Team who won jack
  let jackInPlay = false // Indicate if jack is in play
  let jackHangerTeam = 0; // Team who hung jack
  let jackHangerValue = 0; // Value of card which hung jack
  let count = 0;

  if (!loaded) {
    player = [];
    dealer = 1;
    deck = createDeck();
    kicked = deck.pop();
    console.log("Kicked: " + kicked.Suit + kicked.Value);
  }

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

  // Manage team scores
  const [ score, setScore ] = useState([0, 0]);

  // Manage kicked card
  const [ kickedCard, setKickedCard ] = useState(null);

  // Manage which suit is trump
  const [ trump, setTrump ] = useState(null);

  // Manage whose turn it is to play
  const [ playerTurn, setPlayerTurn ] = useState(1);

  // Manage cards in a lift
  const [ lift, setLift ] = useState([0, 0, 0, 0]);

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
  function deal(player) {
    let card;
    for (var i = 0; i < 3; i++) {
      card = deck.pop();
      player.cards.push(card);
    }
  }

  /* 
    Deal 3 cards to all players
  */
  function dealAll() {
    for (var j = 0; j < 4; j++) {
      deal(player[j]);
    }
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
  function displayPlayerCards() {

    // Arrays to store player cards as a string
    let p1Cards = [];
    let p2Cards = [];
    let p3Cards = [];
    let p4Cards = [];
    
    // Only run function once
    if (!loaded) {
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

      player1CardsVar = p1Cards;
      player2CardsVar = p2Cards;
      player3CardsVar = p3Cards;
      player4CardsVar = p4Cards;
      
      setKickedCard(parseCard(kicked));
      setTrump(kicked.Suit);
      called = kicked.Suit;
    }

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
  function checkKicked() {
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
    console.log("TS: " + teamScore);
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
    if (cardPlayed.Value === "2") {
      lift[playerTurn] = 2;
    }
    else if (cardPlayed.Value === "3") {
      lift[playerTurn] = 3;
    }
    else if (cardPlayed.Value === "4") {
      lift[playerTurn] = 4;
    }
    else if (cardPlayed.Value === "5") {
      lift[playerTurn] = 5;
    }
    else if (cardPlayed.Value === "6") {
      lift[playerTurn] = 6;
    }
    else if (cardPlayed.Value === "7") {
      lift[playerTurn] = 7;
    }
    else if (cardPlayed.Value === "8") {
      lift[playerTurn] = 8;
    }
    else if (cardPlayed.Value === "9") {
      lift[playerTurn] = 9;
    }
    else if (cardPlayed.Value === "X") {
      lift[playerTurn] = 10;
    }
    else if (cardPlayed.Value === "J") {
      lift[playerTurn] = 11;
    }
    else if (cardPlayed.Value === "Q") {
      lift[playerTurn] = 12;
    }
    else if (cardPlayed.Value === "K") {
      lift[playerTurn] = 13;
    }
    else if (cardPlayed.Value === "A") {
      lift[playerTurn] = 14;
    }
    
    // If card played is trump, their card has more power to win lifts
    if (cardPlayed.Suit == trump) {
      lift[playerTurn] += 100;
    }

    // If card played is not of the suit that was called or trumo, their card has less power to win lifts
    if (cardPlayed.Suit !== called && cardPlayed.Suit !== trump) {
      lift[playerTurn] = lift[playerTurn] - 100;
    }
  }

  function checkLift(lift) {
    let highest=0;
    let highIndex=0;
    for (var i=0; i<4; i++) {
      if (lift[i] > highest) {
        highest=lift[i];
        highIndex=i;
      }
    }
    return highIndex;
  }


  /*
    Function that triggers when a card is clicked
  */
  function playCard(event) {
    let team;
    let playerCards;
    let bare;
    let calledTemp;
    let cardPlayedId;
    let cardPlayed;
    let liftWinner;

    // Determine which team the player is on
    if (playerTurn == 1 || playerTurn == 3) {
      team = 1;
    }
    else {
      team = 2;
    } 
    console.log("Team: " + team);

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
    console.log("PC1:" + player1Cards);
    console.log("PC:" + playerCards);

    
    if (called !== "any") {
      for (var i=0; i<playerCards.length; i++) {
        if (playerCards[i].charAt(0) == called) {
          bare=false;
        } 
      }
    }
    if (bare === true) {
      calledTemp = "any";
    }
      
    // Put undertrump code later

    // Get card played
    cardPlayedId = event.currentTarget.id;
    cardPlayed = getCard(cardPlayedId);
    if (called == "any") { // If trump has not been called yet
      called = cardPlayed.Suit;
    }

    console.log("Kicked2: " + kickedCard);
    // If trump is played
    if (cardPlayed.Suit == kickedCard.Suit) { 
      value=getCardValue(cardPlayed);
      if (value > high) {
        highWinner = team;
        high = value;
      }
      if (value < low) {
        lowWinner = team;
        low = value;
      }
      if (value == 11 && jackPlayer == 0) { //If jack has not yet been played
        jackPlayer = team;
        jackWinner = team;
        jackInPlay = true;
      }
      if (value > 11 && jackInPlay == true) { // If jack is in lift and a Queen or higher has been played
        jackWinner = team;
      }
      if (value > 11 && value > jackHangerValue) { // If jack is in lift with a Queen or higher and a Card stronger than the previous royal is played
        jackHangerTeam = team;
        jackHangerValue = value;
      }
    }

    // Find card in playerCards array that correspond to the card clicked
    let card = playerCards.findIndex( element => element.charAt(0) === cardPlayed.Suit && element.charAt(1) === cardPlayed.Value);

    // Remove card clicked from array
    playerCards.splice(card, 1);

    // Update states
    if (playerTurn == 1) {
      setPlayer1Cards(playerCards);
    }
    else if (playerTurn == 2) {
      setPlayer2Cards(playerCards);
    }
    else if (playerTurn == 3) {
      setPlayer3Cards(playerCards);
    }
    else {
      setPlayer4Cards(playerCards);
    }

    // Put card in lift and determine if card would win or lose lift
    getLift(cardPlayed);

    // Increment player turn
    setPlayerTurn(playerTurn+1);

    // Increment count, count determines how many players have played a card for a lift already
    count+=1;

    // Loop back to player 1 after player 4 has played
    if (playerTurn == 5) {
      setPlayerTurn(1);
    }

    // Lift end
    if (count == 4) {
      count = 0;
      if (jackHangerTeam > 0 && jackInPlay) {
      jackWinner[1] = jackHangerTeam;
      }
      jackHangerTeam = 0;
      jackHangerValue = 0; 
      jackInPlay = false;
      called="any";
      liftWinner=checkLift(lift);
      console.log(liftWinner);
      setPlayerTurn(liftWinner);
    }


  }

  /*
    Initialise game
  */
  useEffect(() => {
    if (!loaded) {
      
      setLoaded(true); // Indicate that player cards have been rendered

      for (var i = 0; i < 4; i++) {
        player[i] = new Hand();
      }

      for (var i = 0; i < 2; i++) {
        dealAll();
      }

      displayPlayerCards();
      checkKicked();
    }
  });

  function testFunc(event) {
    let x;
    let card;
    x = player1Cards;
    console.log("Ev: " + event.currentTarget.id);
    card = getCard(event.currentTarget.id);
    console.log("Card: " + card.Suit + card.Value);
  }

  function testFunc2() {
    let x;
    x = [...player1Cards];
    x.pop();
    setPlayer1Cards(x);
  }

  return (
    <div className="container">
      <h1>Brawl Fours</h1>
      <div className="score">
        <p>Score: {score[0]} - {score[1]}</p>
      </div>
      <div className="score row">
        <div className="col-sm-1">
          <p> Kicked: </p>
        </div>
        <PlayingCard key={kickedCard} value={kickedCard}></PlayingCard>
      </div>
      <hr></hr>
      <div className="row hand player1" ref={player1Hand}>
        {
          Array.from({ length: player1Cards.length }, (_, k) => (
            <PlayingCard key={player1Cards[k]} value={player1Cards[k]} onClickHandler={playCard}></PlayingCard>
          ))
        }
      </div>
      <div className="row hand player2" ref={player2Hand}>
        {
          Array.from({ length: player2Cards.length }, (_, k) => (
            <PlayingCard key={player2Cards[k]} value={player2Cards[k]} onClickHandler={playCard}></PlayingCard>
          ))
        }
      </div>
      <div className="row hand player3" ref={player3Hand}>
        {
          Array.from({ length: player3Cards.length }, (_, k) => (
            <PlayingCard key={player3Cards[k]} value={player3Cards[k]} onClickHandler={playCard}></PlayingCard>
          ))
        }
      </div>
      <div className="row hand player4" ref={player4Hand}>
        {
          Array.from({ length: player4Cards.length }, (_, k) => (
            <PlayingCard key={player4Cards[k]} value={player4Cards[k]} onClickHandler={playCard}></PlayingCard>
          ))
        }
      </div>
      <button value="Press" onClick={testFunc}>Press</button>
    </div>
  )
}