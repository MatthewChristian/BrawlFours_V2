export interface ChatMessage {
  message?: string;
  sender?: string;
  messageColour?: string;
  senderColour?: string;
  isSystemMessage?: boolean;
}