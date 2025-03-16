import { Server } from "socket.io"

export interface SendSystemMessageInput {
  io: Server,
  message: string,
  colour?: string,
  showToast?: boolean,
  roomId: string | string[]
}