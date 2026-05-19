export enum SprintStatus {
  PLANNED = 'PLANNED',
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
}

export interface SprintDTO {
  id: string
  projectId: string
  name: string
  goal?: string | null
  startDate?: string | null
  endDate?: string | null
  status: SprintStatus
  createdAt?: string
  updatedAt?: string
}

export interface CreateSprintRequestDTO {
  projectId: string
  name: string
  goal?: string
  startDate?: string
  endDate?: string
}

export interface UpdateSprintRequestDTO {
  name?: string
  goal?: string | null
  startDate?: string | null
  endDate?: string | null
  status?: SprintStatus
}
