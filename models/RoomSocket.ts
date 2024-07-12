import { DeckCard } from './DeckCard';
import { PlayerSocket } from './PlayerSocket';

export interface RoomSocket {
  deck?: DeckCard[];
  kicked?: DeckCard[];
  users?: PlayerSocket[];
  teamScore?: number[];
  dealer?: number;
  turn?: number;
  beg?: 'begging' | 'begged' | 'stand' | 'give' | 'run';
  trump?: string;
  called?: DeckCard;
  high?: DeckCard;
  low?: DeckCard;
  jack?: DeckCard;
  game?: number[];
  highWinner?: number;
  lowWinner?: number;
  jackWinner?: number;
  lift?: DeckCard[];
  roundStarted?: boolean;
}