import { DeckCard } from './DeckCard';
import { PlayCardInput } from './PlayCardInput';
import { PlayerSocket } from './PlayerSocket';

export interface SwapAllyCardInput extends PlayCardInput {
  allyCard: DeckCard;
  playedCard: DeckCard;
}