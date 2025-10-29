import type { MessageDTO } from "../message"
import type { UserDTO } from "../user"

export enum ConversationType {
  AI_CHAT = 'AI_CHAT',
  DIRECT = 'DIRECT',
  GROUP = 'GROUP'
}

export enum MemberRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER'
}

export interface ConversationDTO {
  id? : string
  title? : string
  type : ConversationType
  userId : string
  messages : MessageDTO []
  owner : UserDTO
  members : Partial<ConversationMember> [],
  read : boolean
}

export interface ConversationMember {
  id : string
  conversationId: string
  user : Partial<UserDTO>
  role : MemberRole
  joinedAt : string
}