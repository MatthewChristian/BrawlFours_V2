import { Server } from "socket.io";
import { PlayerSocket } from "../../models/PlayerSocket";
import { DeckCard } from "../../models/DeckCard";
import { RoomSocket } from "../../models/RoomSocket";
import { CardAbilities } from "./abilities";

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

function isCardRoyal(card: DeckCard) {
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
    else if (roomData.activeAbilities?.includes(CardAbilities.royalsDisabled) && isCardRoyal(card) && (!flushRoyalsCalled || (!flushRoyals && bare))) {
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

