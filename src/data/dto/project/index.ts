import type { UserDTO } from "../user"

export enum ProjectMemberRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER',
}

export interface ProjectMemberDTO {
  id?: string
  projectId: string
  userId: string
  user?: Partial<UserDTO>
  role: ProjectMemberRole
  joinedAt?: string
}

export interface ProjectLabelDTO {
  id: string
  name: string
  color: string
}

export interface ProjectDTO {
  id: string
  key: string
  name: string
  description?: string | null
  ownerId: string
  owner?: Partial<UserDTO>
  salonId?: string | null
  issueCounter?: number
  members?: ProjectMemberDTO[]
  createdAt?: string
  updatedAt?: string
}

export interface CreateProjectRequestDTO {
  key: string
  name: string
  description?: string
  salonId?: string
  memberIds?: string[]
}

export interface UpdateProjectRequestDTO {
  name?: string
  description?: string
  salonId?: string | null
}
