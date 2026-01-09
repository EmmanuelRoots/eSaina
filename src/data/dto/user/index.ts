import type { RoleDTO } from '../role'

export interface UserDTO {
  id: string
  firstName: string
  lastName: string
  email: string
  created_at: string
  updated_at: string
  pdpUrl?: string
  role?: RoleDTO
}
