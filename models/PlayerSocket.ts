import { DeckCard } from './DeckCard';

export interface PlayerSocket {
  nickname?: string;
  id?: string;
  socketId?: string;
  teammateSocketId?: string;
  team?: number;
  cards?: DeckCard[];
  numCards?: number;
  player?: number;
  disconnected?: boolean;
}