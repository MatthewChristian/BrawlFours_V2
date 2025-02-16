import { DeckCard } from '../../models/DeckCard';

export function getCardShortcode(cardData?: DeckCard) {
  if (!cardData) {
    return undefined;
  }

  const suit: string = cardData.suit;
  const value: string = cardData.value;

  return suit + value;
}

export function getCardAnchorSelect(cardData?: DeckCard) {
  return 'card_' + getCardShortcode(cardData);
}

export function parseSuit(suit?: string) {
  if (suit == 'c') {
    return 'Clubs'
  }
  else if (suit == 'd') {
    return 'Dimes'
  }
  else if (suit == 's') {
    return 'Spades'
  }
  else if (suit == 'h') {
    return 'Hearts'
  }
}

export function getCardName(cardData?: DeckCard) {
  if (!cardData) {
    return undefined;
  }

  let parsedVal = cardData.value;
  let parsedSuit;

  if (cardData.value.toUpperCase() == 'X') {
    parsedVal = '10'
  }
  else if (cardData.value.toUpperCase() == 'J') {
    parsedVal = 'Jack'
  }
  else if (cardData.value.toUpperCase() == 'Q') {
    parsedVal = 'Queen'
  }
  else if (cardData.value.toUpperCase() == 'K') {
    parsedVal = 'King'
  }
  else if (cardData.value.toUpperCase() == 'A') {
    parsedVal = 'Ace'
  }

  if (cardData.suit == 'c') {
    parsedSuit = 'Clubs'
  }
  else if (cardData.suit == 'd') {
    parsedSuit = 'Dimes'
  }
  else if (cardData.suit == 's') {
    parsedSuit = 'Spades'
  }
  else if (cardData.suit == 'h') {
    parsedSuit = 'Hearts'
  }


  return parsedVal + ' of ' + parsedSuit;
}