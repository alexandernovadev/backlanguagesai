import { ChatRole } from "../business";

// ChatMessage interface - Shared across Word and Expression models
export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: Date;
}
