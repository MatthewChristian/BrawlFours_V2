import { DeckCard } from '../models/DeckCard';

export function createDeck() {
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
  // shuffle(deck);
  return deck;
}