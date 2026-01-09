import type { TABLE_NAME } from '../../constants/table.constant'
import { UseAuth } from '../../context/user'
import type { AuthorizationDto } from '../../data/dto/role'

export enum RoleAction {
  create = 'create',
  read = 'read',
  update = 'update',
  delete = 'delete',
}

export const CanDoAction = (
  tableName: keyof typeof TABLE_NAME,
  action: keyof typeof RoleAction
): boolean => {
  const { user } = UseAuth()

  if (!user) return false

  const role = user.role
  if (!role) return false

  const auth: AuthorizationDto | undefined = role.authorizations.find(
    a => a.tableName === (tableName as string)
  )

  if (!auth) return false

  return Boolean(auth[action])
}
