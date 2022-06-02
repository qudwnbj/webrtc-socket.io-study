export interface ChatMessage {
  type: 'message' | 'notice';
  userId?: string;
  userName?: string;
  message: string;
}
