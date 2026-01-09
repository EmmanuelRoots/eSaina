import type { UserDTO } from '../user'

export enum PostType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
}

export enum ReactionType {
  LIKE = 'LIKE',
  LOVE = 'LOVE',
  HAHA = 'HAHA',
  WOW = 'WOW',
  SAD = 'SAD',
  ANGRY = 'ANGRY',
}

export enum SalonMemberRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export interface SalonDTO {
  id?: string
  title?: string
  description?: string
  post: Partial<PostDTO>[]
  members: SalonMemberDTO[]
}

export interface SalonMemberDTO {
  id?: string
  salon: Partial<SalonDTO>
  user: Partial<UserDTO>
  role: SalonMemberRole
}

export interface CommentDTO {
  id?: string
  content: string
  author: Partial<UserDTO>
  post: Partial<PostDTO>
  parent?: CommentDTO
  replies?: CommentDTO[]
  reactions?: ReactionDTO[]
  createdAt: string
}

export interface ReactionDTO {
  id?: string
  type: ReactionType
  user: Partial<UserDTO>
  post: Partial<PostDTO>
  comment: Partial<CommentDTO>
}

export interface PostDTO {
  id?: string
  content: string
  type: PostType
  author: Partial<UserDTO>
  mediaUrls: string[]
  reactions: ReactionDTO[]
  comments: CommentDTO[]
  salon: SalonDTO
  createdAt: string
}
