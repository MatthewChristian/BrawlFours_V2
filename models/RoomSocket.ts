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
}