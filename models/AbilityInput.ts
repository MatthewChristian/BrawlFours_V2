import { Server, Socket } from "socket.io";
import { DeckCard } from "./DeckCard";
import { RoomSocket } from "./RoomSocket";
import { PlayerSocket } from "./PlayerSocket";

export interface AbilityInput {
   roomData: RoomSocket,
   card: DeckCard
   socket: Socket;
   io: Server;
   id: string;
   player: PlayerSocket;
   roomId: string;
}