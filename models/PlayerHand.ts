import { DeckCard } from './DeckCard';

export interface PlayerHand {
  cards: DeckCard[]
  canPlay: boolean
}