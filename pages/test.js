import React, { useState, useEffect } from 'react';

export default function FirstPost() {


  class Hand {
    constructor() {
      this.cards=[];
      this.canPlay=false;
    }
  
    setCanPlay() {
      canPlay=true;
    }
  }

  function createDeck() {
    var suits = ["s", "d", "c", "h"]; //S=Spades, D=Dimes, C=Clubs, H=Hearts
    var values = ["2", "3", "4", "5", "6", "7", "8", "9", "X", "J", "Q", "K", "A"]; //X=10, This is done so it is 1 character
    var deck = new Array();
    for (var i=0; i<suits.length; i++) {
      for (var j=0; j<values.length; j++) {
        var card={Suit: suits[i], Value: values[j]};
        deck.push(card);
      }
    }
    shuffle(deck);
    return deck;
  }
  
  function shuffle(deck) {
    for (var i = 0; i < 1000; i++) {
      var loc1 = Math.floor((Math.random() * deck.length));
      var loc2 = Math.floor((Math.random() * deck.length));
      var temp = deck[loc1];
      deck[loc1] = deck[loc2];
      deck[loc2] = temp;
    }
  }

  function deal(player,deck) {
    var card;
    for (var i=0; i<3; i++) {
      card=deck.pop();
      player.cards.push(card);
    }
  }
  
  function dealAll(player,deck) {
    for (var j=0; j<4; j++) {
      deal(player[j],deck);
    }
  }

  useEffect(() => {
    let game=0;
    let dealer=4;
    let playerTurn=0;
    let player = [];
    let lift = [0,0,0,0,0,0]; //Index 0 - 3: Players 1 - 4 points, Index 4: Team 1 total points for game, Index 5: Team 2 total points for game
    let highLow = [0,0,0,15]; //Index 1: Team winning High, Index 2: Team winning Low, Index 3: High, Index 4: Low
    var jackWinner = [0,0,0]; //First index = Who played jack, Second index = Who won jack, Third index = value
    var score = [0,0];
    let deck=createDeck();
    let kicked=deck.pop();

    for (var i=0; i<4; i++) {
      player[i] = new Hand();
    }

    for (var i=0; i<2; i++) {
      dealAll(player,deck);
    }

    console.log(player[0]);
  });

    return (
      <div className="container">
        <h1>First Post</h1>
        <div className="row hand player1">
          <div className="col-sm-2">
            <div className="card">
              <p> test</p>
            </div>
            </div>
          <div className="col-sm-2">
            <p> Again</p>
          </div>
        </div> 
      </div>
    )
  }