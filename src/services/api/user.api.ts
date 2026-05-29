import { LocalStorageKeys } from "../../constants/storage.constant"
import { urls } from "../../constants/urls"
import type { GoogleLoginDTO, LoginDTO, SubscribeDTO } from "../../data/dto/login"
import { axiosInstance } from "../utils/axios.utils"

const logUser = async (credentials: LoginDTO) => {
  const {data} = await axiosInstance.post(urls.user.LOGIN, credentials).catch((err)=> {throw err})

  return data
}

const subscribe = async (credentials: SubscribeDTO) => {
  const {data} = await axiosInstance.post(urls.user.SUBSCRIBE, credentials).catch((err)=> {throw err})

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

const searchUser = async ({page=1,limit=20,searchTerm=''}:{page:number, limit:number, searchTerm:string}) =>{
  const {data} = await axiosInstance.get(urls.user.SEARCH_USER,{params:{searchTerm,page,limit}}).catch((err)=> {throw err})

  return data.data
}

export default {
  logUser,
  subscribe,
  getUserByToken,
  logOut,
  googleLogin,
  searchUser
}