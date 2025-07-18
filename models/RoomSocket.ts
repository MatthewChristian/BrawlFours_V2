import { CardAbilities } from '../core/services/abilities';
import { DeckCard } from './DeckCard';
import { LiftCard } from './LiftCard';
import { PlayerSocket } from './PlayerSocket';
import { PlayerStatus } from './PlayerStatus';

export interface RoomSocket {
  gameStarted?: boolean;

  deck?: DeckCard[];
  kicked?: DeckCard[];
  users?: PlayerSocket[];

  teamScore?: number[];
  dealer?: number;
  turn?: number;
  beg?: 'begging' | 'begged' | 'stand' | 'give' | 'run';
  pendingTurn?: number[];
  tempPendingTurn?: number;
  allyPlaysLastPlayer?: number;
  chooseStarterPlayer?: number;

  trump?: string;
  called?: DeckCard;

  high?: DeckCard;
  low?: DeckCard;
  jack?: DeckCard;
  game?: number[];

  highWinner?: PlayerSocket;
  lowWinner?: PlayerSocket;
  jackWinner?: PlayerSocket;

  lift?: LiftCard[];
  roundStarted?: boolean;
  hangJack?: boolean;
  jackSaved?: boolean;

  matchWinner?: number

  gameIsTwo?: boolean;

  activeAbilities?: CardAbilities[];
  playerStatus?: PlayerStatus[];

  twosPlayed?: ('d' | 's' | 'h')[];
  twoWinGameWinnerTeam?: number;

  revealedBare?: boolean[];

  doubleLiftCards?: LiftCard[];
  doubleLiftJack?: LiftCard;
}