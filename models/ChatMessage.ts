import { ChatInput } from './ChatInput';

export interface ChatMessage {
  message?: string;
  sender?: string;
  mode?: ChatInput['mode'];
  messageColour?: string;
  senderColour?: string;
  modeColour?: string;
  showToast?: boolean;
}