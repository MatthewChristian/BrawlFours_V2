import { RoomSocket } from './RoomSocket';

export interface RoundWinners {
  highWinner: RoomSocket['highWinner'];
  high: RoomSocket['high'];
  lowWinner: RoomSocket['lowWinner'];
  low: RoomSocket['low'];
  jackWinner: RoomSocket['jackWinner'];
  jack: RoomSocket['jack'];
  hangJack: RoomSocket['hangJack'];
  game: RoomSocket['game'];
  twoWinGameWinnerTeam?: number;
}