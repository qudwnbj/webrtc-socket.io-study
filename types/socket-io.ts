import { Socket } from 'socket.io-client';
import type { ChatMessage } from './chat';

export interface ServerToClientEvents {
  notice: (chatMessage: ChatMessage) => void;
  receive_message: (chatMessage: ChatMessage) => void;
}
export interface ClientToServerEvents {
  join_room: (roomName: string, userName: string, callback: (isSuccess: boolean) => void) => void;
  send_message: (roomName: string, message: string, callback: (isSuccess: boolean) => void) => void;
  send_call: (roomName: string) => void;
}
export interface SocketData {
  userName: string;
}

export type MySocket = Socket<ServerToClientEvents, ClientToServerEvents>;
