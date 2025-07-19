import { PlayerSocket } from './PlayerSocket';

export interface ScoreLiftOutput {
  liftWinnerPlayer: PlayerSocket;
  highestHangerPlayer?: PlayerSocket;
  jackOwnerPlayer?: PlayerSocket;
  jackSaved?: boolean;
}