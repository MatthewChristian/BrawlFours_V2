import { DeckCard } from './DeckCard';
import { PlayCardInput } from './PlayCardInput';
import { PlayerSocket } from './PlayerSocket';

export interface TargetPlayerInput extends PlayCardInput {
  target: PlayerSocket;
  playedCard: DeckCard;
}