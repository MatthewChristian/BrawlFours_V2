import React, { useState, useEffect, useRef } from 'react';
import PlayingCard from "../components/PlayingCard"


export default function FirstPost() {

  let player = [];
  let deck = createDeck();

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
    let values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
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
    for (var i = 0; i < 3; i++) {
      card = deck.pop();
      player.cards.push(card);
    }
  }

  /* 
    Deal 3 cards to all players
  */
  function dealAll(player, deck) {
    for (var j = 0; j < 4; j++) {
      deal(player[j], deck);
    }
  }


  function displayPlayerCards() {
    let p1Cards = [];

    for (var i=0; i<player[0].cards.length; i++) {
      p1Cards[i] = player[0].cards[i].Suit + player[0].cards[i].Value;
    }

    setPlayer1Cards(p1Cards);

    let p2Cards = [...player2Cards]; 
    setPlayer1Cards(p1Cards);

    let p3Cards = [...player3Cards]; 
    setPlayer1Cards(p1Cards);

    let p4Cards = [...player4Cards]; 
    setPlayer1Cards(p1Cards);
  }

  /*
    Initialise game
  */
  useEffect(() => {
    let game = 0;
    let dealer = 4;
    let playerTurn = 0;
    let lift = [0, 0, 0, 0, 0, 0]; //Index 0 - 3: Players 1 - 4 points, Index 4: Team 1 total points for game, Index 5: Team 2 total points for game
    let highLow = [0, 0, 0, 15]; //Index 1: Team winning High, Index 2: Team winning Low, Index 3: High, Index 4: Low
    let jackWinner = [0, 0, 0]; //First index = Who played jack, Second index = Who won jack, Third index = value
    let score = [0, 0];
    let kicked = deck.pop();

    for (var i = 0; i < 4; i++) {
      player[i] = new Hand();
    }

    for (var i = 0; i < 2; i++) {
      dealAll(player, deck);
    }

    //displayPlayerCards();

    console.log(player[0]);
  });

  function testFunc() {
    let x;
    x = player[0].cards[0].Suit + player[0].cards[0].Value;
    console.log(x);
  }

  return (
    <div className="container">
      <h1>First Post</h1>
      <div className="row hand player1" ref={player1Hand}>
        {
          Array.from({ length: player1Cards.length }, (_, k) => (
            <PlayingCard value={player1Cards[k]}></PlayingCard>
          ))
        }
      </div>
      <div className="row hand player2" ref={player2Hand}>
        <PlayingCard value={player1Cards}></PlayingCard>
      </div>
      <div className="row hand player3" ref={player3Hand}>
        <PlayingCard value={player1Cards}></PlayingCard>
      </div>
      <div className="row hand player4" ref={player4Hand}>
        <PlayingCard value={player1Cards}></PlayingCard>
      </div>
      <button value="Press" onClick={testFunc}>Press</button>
    </div>
  )
}