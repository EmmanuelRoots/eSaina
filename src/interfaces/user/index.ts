import type { GoogleLoginDTO, LoginDTO, SubscribeDTO } from "../../data/dto/login"
import type { UserDTO } from "../../data/dto/user"

export interface UserActions {
    login: (credentials : LoginDTO | GoogleLoginDTO) => void
    subscribe: (credentials : SubscribeDTO) => Promise<void>
    logout: () => void
    user?: UserDTO | undefined
    loading : boolean
}