import { CardAbilities } from "../core/services/abilities";
import { RoomSocket } from "./RoomSocket";

export type AbilityData = {
  [key in CardAbilities]: {
    description: string;
    ability: (roomData: RoomSocket) => void;
  };
};