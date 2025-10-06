import type { ConversationDTO } from "../conversation"
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
  content : string
  type : MessageType
  senderType : SenderType
  conversation : ConversationDTO
  user : UserDTO
}