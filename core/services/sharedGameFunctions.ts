import { Server } from "socket.io";
import { PlayerSocket } from "../../models/PlayerSocket";
import { DeckCard } from "../../models/DeckCard";
import { RoomSocket } from "../../models/RoomSocket";
import { CardAbilities, getIsRandom, mapAbility } from "./abilities";
import { ScoreLiftOutput } from "../../models/ScoreLiftOutput";

export function emitPlayerCardData(users: PlayerSocket[], io: Server) {
  // Loop through users in room
  users.forEach((el) => {
    // Send player card data to each player
    io.to(el.socketId).emit('playerCards', el.cards);
  });
}

export function orderCards(users: PlayerSocket[]) {
  const order: string[] = ['s', 'h', 'c', 'd'];

  users.forEach(el => {
    const orderedPlayerCards = [...el.cards];

    orderedPlayerCards.sort(function (a, b) {
      const aSuitIndex = order.findIndex(el => el == a.suit);
      const bSuitIndex = order.findIndex(el => el == b.suit);

      if (aSuitIndex < bSuitIndex) { return -1; }
      if (aSuitIndex > bSuitIndex) { return 1; }
      if (a.power < b.power) { return -1; }
      if (a.power > b.power) { return 1; }
      return 0;
    });

    el.cards = orderedPlayerCards;
  });
}

export function shuffleDeck(deck: DeckCard[]) {
  let loc1: number;
  let loc2: number;
  let temp: DeckCard;

  for (let i = 0; i < 1000; i++) {
    loc1 = Math.floor((Math.random() * deck.length));
    loc2 = Math.floor((Math.random() * deck.length));
    temp = deck[loc1];
    deck[loc1] = deck[loc2];
    deck[loc2] = temp;
  }
}


export function initialiseDeck() {
  const suits = ['s', 'd', 'c', 'h']; // s=Spades, d=Dimes, c=Clubs, h=Hearts
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', 'X', 'J', 'Q', 'K', 'A'];
  const power = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  const points = [0, 0, 0, 0, 0, 0, 0, 0, 10, 1, 2, 3, 4];
  const deck: DeckCard[] = [];
  let card: DeckCard;
  for (let i = 0; i < suits.length; i++) {
    for (let j = 0; j < values.length; j++) {

      const ability = mapAbility(values[j], suits[i]);

      card = {
        suit: suits[i],
        value: values[j],
        power: power[j],
        points: ability == CardAbilities.twentyPoints ? 20 : points[j],
        playable: false,
        ability: ability,
        isRandom: getIsRandom(values[j], suits[i]),
        trump: false
      };
      deck.push(card);
    }
  }

  return deck;
}

/*
    Determine whether or not a player tried to undertrump
  */
function didUndertrump(roomData: RoomSocket, card: DeckCard) {
  if (!roomData.lift || !roomData.trump || card?.suit != roomData.trump) {
    return false;
  }

  let undertrumped = false;

  roomData.lift.forEach(el => {
    if ((el.suit == roomData.trump) && (el.power > card.power)) {
      undertrumped = true;
    }
  });

  return undertrumped;
}

export function isCardRoyal(card: DeckCard) {
  if (card.value?.toUpperCase() == 'J'
    || card.value?.toUpperCase() == 'Q'
    || card.value?.toUpperCase() == 'K'
    || card.value?.toUpperCase() == 'A'
  ) {
    return true;
  }

return false;
}

export function determineIfCardsPlayable(roomData: RoomSocket, player: PlayerSocket) {
  let bare = true;
  let flush = true;
  let flushRoyalsCalled = true;
  let flushRoyals = true;
  const trump = roomData.trump;


  player.cards.forEach((el) => {
    // Determine which cards are trump
    if (el.suit == roomData.trump) {
      el.trump = true;
    }
    else { // Need to put else statement in case pack was run
      el.trump = false;
    }

    // Determine if a player does not have a card in the suit of the card that was called
    if (roomData.called && (el.suit == roomData.called.suit)) {
      bare = false;
    }

    // Determine if player is flush (only has trump in hand)
    if (!el.trump) {
      flush = false;
    }

    // Determine if a player only has royals in the suit that called
    if (!isCardRoyal(el)) {
      flushRoyals = false;

      if (roomData.called && (el.suit == roomData.called.suit)) {
        flushRoyalsCalled = false;
      }
    }
  });

  player.cards.forEach((card) => {
    const undertrumped = didUndertrump(roomData, card);

    // If the card has an ability that allows them to be played (and abilities are not disabled)
    if (card.ability == CardAbilities.alwaysPlayable && !roomData.activeAbilities?.includes(CardAbilities.abilitiesDisabled)) {
      card.playable = true;
    }
    // If card is trump but trump is disabled for that round and the player is not flush and trump was not called
    else if (roomData.activeAbilities?.includes(CardAbilities.trumpDisabled) && card.trump && !flush && roomData.called && card.suit != roomData.called.suit) {
      card.playable = false;
    }
    // If card is a royal but royals are disabled for that round and the player is not flush in the suit that was called
    else if (roomData.activeAbilities?.includes(CardAbilities.royalsDisabled) && isCardRoyal(card) && (!flushRoyalsCalled || (flushRoyalsCalled && !flushRoyals && card.suit == trump) || (!flushRoyals && bare))) {
      card.playable = false;
    }
    // If the player:
    // * Played a suit that wasn't called,
    // * Wasn't the first player to play for the round,
    // * Has cards in their hand that correspond to the called suit, and
    // * the card played is not trump,
    // then end function and do not add card to lift
    else if (roomData.called && card.suit != roomData.called.suit && !bare && card.suit != trump) {
      card.playable = false;
    }
    // If the player attempted to undertrump, end function and do not add card to lift
    else if (roomData.called && (card.suit == roomData.trump && undertrumped == true) && roomData.called.suit != trump && !bare) {
      card.playable = false;
    }
    else {
      card.playable = true;
    }

  });
}



export function scoreLift(roomData: RoomSocket): ScoreLiftOutput {

  let highestHangerPower = 0;
  let highestHangerPlayer: PlayerSocket;
  let jackOwnerPlayer: PlayerSocket;
  let liftWinnerPlayer: PlayerSocket;

  let highestPowerInLift = 0;
  let liftPoints = 0;


  // Loop through lift
  roomData.lift.forEach(el => {
    // Add 100 points to power if card was trump, minus 100 points from power if card was not suit that was called
    const power = el.power + (el.suit == roomData.trump ? 100 : el.suit != roomData.called.suit ? -100 : 0);
    const player = roomData.users.find(usr => usr.player == el.player);

    // If card ability

    if (el.suit == roomData.trump) {

      // Store potential high
      if (!roomData.high || el.power > roomData.high.power) {
        roomData.highWinner = player;
        roomData.high = el;
      }

      // Store potential low
      if (!roomData.low || el.power < roomData.low.power) {
        roomData.lowWinner = player;
        roomData.low = el;
      }

      // Determine if Jack is in lift
      if (el.value == 'J') {
        jackOwnerPlayer = player;
        roomData.jack = el;
      }

    }

    // Determine if hanger in lift
    if (power > 111 && power > highestHangerPower) {
      highestHangerPower = power;
      highestHangerPlayer = player;
    }

    // Determine if card is winning the lift
    if (power > highestPowerInLift) {
      liftWinnerPlayer = player;
      highestPowerInLift = power;
    }

    // Tally lift points
    liftPoints = liftPoints + el.points;

  });

  if (!roomData.game) {
    roomData.game = [0, 0];
  }

  // Assign points for game
  if (!roomData.activeAbilities.includes(CardAbilities.noWinLift)) { // Check to see if teams are allowed to earn points for this lift
    if (liftWinnerPlayer.team == 1) {
      roomData.game[0] = roomData.game[0] + liftPoints;
    }
    else if (liftWinnerPlayer.team == 2) {
      roomData.game[1] = roomData.game[1] + liftPoints;
    }
  }

  // Determine who won/hung Jack
  if (jackOwnerPlayer) {
    if (highestHangerPlayer && highestHangerPlayer.team != jackOwnerPlayer.team) { // Hang Jack
      roomData.jackWinner = highestHangerPlayer;
      roomData.hangJack = true;
    }
    else {
      roomData.jackWinner = jackOwnerPlayer;
    }
  }

  return ({
    liftWinnerPlayer: liftWinnerPlayer,
    highestHangerPlayer: highestHangerPlayer,
    jackOwnerPlayer: jackOwnerPlayer
  })
}