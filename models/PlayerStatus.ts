import { CardAbilities } from "../core/services/abilities";
import { PlayerSocket } from "./PlayerSocket";

export interface PlayerStatus {
  player: PlayerSocket;
  status: CardAbilities[];
}