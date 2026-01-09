import { createContext, useContext, useEffect, useState, type JSX } from 'react'

import type { UserActions } from '../../interfaces/user'
import type { GoogleLoginDTO, LoginDTO } from '../../data/dto/login'
import type { UserDTO } from '../../data/dto/user'
import userApi from '../../services/api/user.api'
import { LocalStorageKeys } from '../../constants/storage.constant'
import { DEVICE_INFO } from '../../constants/deviceInfo'

const defaultValue: UserActions = {
  login: () => {
    /** */
  },
  user: undefined,
  logout: () => {
    /** */
  },
  loading: false,
}

const userContext = createContext<UserActions>(defaultValue)

const AuthProvider = (props: { children: JSX.Element }) => {
  const [user, setUser] = useState<UserDTO | undefined>(undefined)
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    const token = localStorage.getItem(LocalStorageKeys.ACCESS_TOKEN)

    if (token) {
      userApi.getUserByToken().then(res => {
        setUser(res.data)
      })
    }
  }, [])

  const login = async (credentials: LoginDTO | GoogleLoginDTO) => {
    setLoading(true)
    let res = null
    try {
      if ('family_name' in credentials || 'given_name' in credentials) {
        console.log('google auth')
        res = await userApi.googleLogin({
          family_name: (credentials as GoogleLoginDTO).family_name,
          email: credentials.email,
          given_name: credentials.given_name,
          deviceInfo: DEVICE_INFO.platform,
          picture: (credentials as GoogleLoginDTO).picture,
        } as GoogleLoginDTO)
      } else {
        res = await userApi.logUser({
          ...credentials,
          deviceInfo: DEVICE_INFO.platform,
        })
      }
      localStorage.setItem(LocalStorageKeys.ACCESS_TOKEN, res.data.accessToken)
      localStorage.setItem(
        LocalStorageKeys.REFRESH_TOKEN,
        res.data.refreshToken
      )
      const usr = await userApi.getUserByToken()
      console.log({ usr })

      setUser(usr.data)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err.response.data.message)
      throw err // 👈 important : pour que GenericForm attrape l'erreur
    } finally {
      // setTimeout(()=> {
      //     setLoading(false);
      // },2000) //pour tester le loading
      setLoading(false)
    }
  }
  const logout = async () => {
    setLoading(true)
    await userApi.logOut().catch(err => {
      throw err
    })
    // console.log({res});

    setUser(undefined)
    window.location.href = '/'
    setTimeout(() => {
      setLoading(false)
    }, 2000)
    return
  }

  return (
    <userContext.Provider value={{ login, logout, user, loading }}>
      {props.children}
    </userContext.Provider>
  )
}

export default AuthProvider
export const UseAuth = () => useContext(userContext)
