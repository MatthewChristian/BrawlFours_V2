import { DeckCard } from './DeckCard';
import { PlayCardInput } from './PlayCardInput';

export interface SwapAllyCardInput extends PlayCardInput {
  allyCard: DeckCard;
  playedCard: DeckCard;
}