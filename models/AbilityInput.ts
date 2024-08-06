import { DeckCard } from "./DeckCard";
import { RoomSocket } from "./RoomSocket";

export interface AbilityInput {
   roomData: RoomSocket,
   card: DeckCard
}