import type { UserDTO } from "../user"

/** Projection d'un WorkLog retournée par l'API. */
export interface WorkLogDTO {
  id: string
  issueId: string
  issueKey?: string
  issueTitle?: string
  userId: string
  user: Pick<UserDTO, "id" | "firstName" | "lastName" | "pdpUrl">
  date: string
  timeSpentMinutes: number
  description?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateWorkLogDTO {
  issueId: string
  date: string
  timeSpentMinutes: number
  description?: string
}

export interface UpdateWorkLogDTO {
  date?: string
  timeSpentMinutes?: number
  description?: string | null
}
