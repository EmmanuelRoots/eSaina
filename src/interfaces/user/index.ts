import type { GoogleLoginDTO, LoginDTO } from '../../data/dto/login'
import type { UserDTO } from '../../data/dto/user'

export interface UserActions {
  login: (credentials: LoginDTO | GoogleLoginDTO) => void
  logout: () => void
  user?: UserDTO | undefined
  loading: boolean
}
