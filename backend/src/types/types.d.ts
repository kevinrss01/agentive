export interface Message {
  id: string;
  type: 'text' | 'audio';
  content?: string;
  role: 'assistant' | 'user';
  timestamp: Date;
  isProgress?: boolean;
  isAskingForMoreInformation?: boolean;
}
