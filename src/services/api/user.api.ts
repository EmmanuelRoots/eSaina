import { LocalStorageKeys } from "../../constants/storage.constant"
import { urls } from "../../constants/urls"
import type { GoogleLoginDTO, LoginDTO } from "../../data/dto/login"
import { axiosInstance } from "../utils/axios.utils"

const logUser = async (credentials: LoginDTO) => {
  const {data} = await axiosInstance.post(urls.user.LOGIN, credentials).catch((err)=> {throw err})

  return data
}

const googleLogin = async (credentials : GoogleLoginDTO) => {
  const {data} = await axiosInstance.post(urls.user.GOOGLE_LOGIN, credentials).catch((err)=> {throw err})

  return data
}

const getUserByToken = async () => {
  const {data} = await axiosInstance.get(urls.user.GET_USER_BY_TOKEN).catch((err)=> {throw err})

  return data
}

const logOut = async () => {
  const refreshToken = localStorage.getItem(LocalStorageKeys.REFRESH_TOKEN)
  const res = await axiosInstance.post(urls.user.LOGOUT,{refreshToken}).catch((err)=> {throw err})
  localStorage.removeItem(LocalStorageKeys.ACCESS_TOKEN)
  localStorage.removeItem(LocalStorageKeys.REFRESH_TOKEN)

  return res
}

export default {
  logUser,
  getUserByToken,
  logOut,
  googleLogin
}