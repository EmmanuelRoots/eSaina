import type { UserDTO } from "../user"

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE'
}

export enum SenderType {
  SYSTEM = 'SYSTEM',
  AI = 'AI',
  USER = 'USER'
}

export interface MessageDTO {
  id : string
  content : string
  type : MessageType
  sender : SenderType
  user : Partial<UserDTO>
}