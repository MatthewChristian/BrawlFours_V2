import { DeckCard } from './DeckCard';
import { PlayCardInput } from './PlayCardInput';
import { PlayerSocket } from './PlayerSocket';

export interface SwapOppCardInput extends PlayCardInput {
  target: PlayerSocket;
  playedCard: DeckCard;
}