import type { MessageDTO } from "../message"
import type { UserDTO } from "../user"

export enum ConversationType {
  AI_CHAT = 'AI_CHAT',
  DIRECT = 'DIRECT',
  GROUP = 'GROUP'
}

export interface ConversationDTO {
  id? : string
  title? : string
  type : ConversationType
  userId : string
  messages : MessageDTO []
  owner : UserDTO
}