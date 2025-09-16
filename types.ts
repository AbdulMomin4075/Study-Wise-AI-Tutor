export type Role = 'user' | 'model';

export type Theme = 'light' | 'dark';

export interface MessagePart {
  text: string;
}

export interface FileAttachment {
  name: string;
  type: string;
  size: number;
}

export interface Message {
  id: string;
  role: Role;
  parts: MessagePart[];
  file?: FileAttachment;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}
