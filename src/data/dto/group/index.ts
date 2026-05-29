export type GroupMemberRole = 'OWNER' | 'MEMBER'

export interface GroupMemberDTO {
  id: string
  userId: string
  role: GroupMemberRole
  joinedAt: string
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    pdpUrl?: string
  }
}

export interface GroupSummaryDTO {
  id: string
  name: string
  description?: string | null
  createdAt: string
  updatedAt: string
  createdById: string
  memberCount: number
}

export interface GroupDetailDTO extends GroupSummaryDTO {
  members: GroupMemberDTO[]
}

export interface GroupListResponse {
  success: true
  data: GroupSummaryDTO[]
  pagination: {
    currentPage: number
    pageSize: number
    totalCount: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export interface GroupListParams {
  page?: number
  limit?: number
  search?: string
}

export interface GroupCreateDTO {
  name: string
  description?: string | null
  memberIds?: string[]
}

export interface GroupUpdateDTO {
  name?: string
  description?: string | null
}

export interface GroupAddMembersDTO {
  userIds: string[]
}

export interface GroupUpdateMemberRoleDTO {
  role: GroupMemberRole
}
