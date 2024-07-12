import { DeckCard } from './DeckCard';

export interface LiftCard extends DeckCard {
  player?: number;
}