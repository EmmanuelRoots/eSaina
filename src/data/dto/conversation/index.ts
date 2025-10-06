import type { MessageDTO } from "../message"
import type { UserDTO } from "../user"

export enum ConversationType {
  REGULAR = 'REGULAR',
  AI_CHAT = 'AI_CHAT'
}

export interface ConversationDTO {
  id? : string
  title? : string
  type : ConversationType
  userId : string
  messages : MessageDTO []
  owner : UserDTO
}