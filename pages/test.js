import React, { useState, useEffect, useRef } from 'react';
import PlayingCard from "../components/PlayingCard"


export default function FirstPost() {

  // Indicate if the game has been initialised as yet
  const [ loaded, setLoaded ] = useState(false);

  let player;
  let deck;
  let kicked;
  let dealer;
  let player1CardsVar;
  let player2CardsVar;
  let player3CardsVar;
  let player4CardsVar;
  let called = "s";

  if (!loaded) {
    player = [];
    dealer = 1;
    deck = createDeck();
    kicked=deck.pop();
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

  // Manage whose turn it is to play
  const [ playerTurn, setPlayerTurn ] = useState(1);

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
    Function that triggers when a card is clicked
  */
  function playCard() {
    let team;
    let playerCards;
    let bare;
    let calledTemp;

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
      playerCards = player1CardsVar;
    }
    else if (playerTurn == 2) {
      playerCards =  player2CardsVar;
    }
    else if (playerTurn == 3) {
      playerCards =  player3CardsVar;
    }
    else {
      playerCards =  player4CardsVar;
    }
    console.log("PC1:" + player1Cards);
    console.log("PC:" + playerCards);

    
    if (called !== "any") {
      for (var i=0; i<playerCards.length; i++) {
        console.log("PCi: " + playerCards[i]);
        if (playerCards[i].charAt(0) == called) {
          bare=false;
          console.log("Not bare");
        } 
      }
    }
    if (bare === true) {
      calledTemp = "any";
    }
      
    // Put undertrump code later

    

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
      playCard();
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
            <PlayingCard key={player1Cards[k]} value={player1Cards[k]} onClickHandler={testFunc}></PlayingCard>
          ))
        }
      </div>
      <div className="row hand player2" ref={player2Hand}>
        {
          Array.from({ length: player2Cards.length }, (_, k) => (
            <PlayingCard key={player2Cards[k]} value={player2Cards[k]}></PlayingCard>
          ))
        }
      </div>
      <div className="row hand player3" ref={player3Hand}>
        {
          Array.from({ length: player3Cards.length }, (_, k) => (
            <PlayingCard key={player3Cards[k]} value={player3Cards[k]}></PlayingCard>
          ))
        }
      </div>
      <div className="row hand player4" ref={player4Hand}>
        {
          Array.from({ length: player4Cards.length }, (_, k) => (
            <PlayingCard key={player4Cards[k]} value={player4Cards[k]}></PlayingCard>
          ))
        }
      </div>
      <button value="Press" onClick={testFunc}>Press</button>
    </div>
  )
}