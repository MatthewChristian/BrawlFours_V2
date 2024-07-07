import { DeckCard } from './DeckCard';

export interface PlayerSocket {
  nickname?: string;
  id?: string;
  team?: number;
  cards?: DeckCard[];
  numCards?: number;
  player?: number;
}