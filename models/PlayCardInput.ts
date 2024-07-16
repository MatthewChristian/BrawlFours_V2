import { BasicRoomInput } from './BasicRoomInput';
import { DeckCard } from './DeckCard';

export interface PlayCardInput extends BasicRoomInput {
  card: DeckCard;
  player: number;
}