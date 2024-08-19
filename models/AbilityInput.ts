import { Server, Socket } from "socket.io";
import { DeckCard } from "./DeckCard";
import { RoomSocket } from "./RoomSocket";

export interface AbilityInput {
   roomData: RoomSocket,
   card: DeckCard
   socket: Socket;
   io: Server;
   id: string;
}