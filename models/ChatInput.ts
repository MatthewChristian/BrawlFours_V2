import { BasicRoomInput } from "./BasicRoomInput";

export interface ChatInput extends BasicRoomInput {
  message?: string;
  mode?: 'all' | 'team' | 'log';
}