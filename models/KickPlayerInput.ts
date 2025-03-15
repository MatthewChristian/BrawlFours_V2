import { BasicRoomInput } from "./BasicRoomInput";

export interface KickPlayerInput extends BasicRoomInput {
  kickedPlayerSocketId?: string;
  kickedPlayerNickname?: string;
}