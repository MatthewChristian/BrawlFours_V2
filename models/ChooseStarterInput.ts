import { PlayCardInput } from './PlayCardInput';
import { PlayerSocket } from './PlayerSocket';

export interface ChooseStarterInput extends PlayCardInput {
  target: PlayerSocket;
}