import { DeckCard } from "./DeckCard";
import { PlayCardInput } from "./PlayCardInput";

export interface TargetLiftInput extends PlayCardInput {
  playedCard?: DeckCard;
}