import { initialiseDeck } from '../core/services/sharedGameFunctions';
import { DeckCard } from '../models/DeckCard';

export const testCard: DeckCard = {
  suit: '',
  value: '',
  power: 0,
  points: 0,
  playable: false,
  isRandom: false,
  trump: false,
};

export const testDeck: DeckCard[] = initialiseDeck();