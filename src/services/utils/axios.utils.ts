import axios, { type AxiosInstance, type CancelTokenSource } from 'axios';
import { LocalStorageKeys } from '../../constants/storage.constant';


export const axiosInstance: AxiosInstance = axios.create({
  timeout: 30000, // le temps maximal d'execution d'une requete est de 30s
  baseURL: import.meta.env.VITE_BASE_URL
})

let cancelTokenSource: CancelTokenSource

export const cancelRequest = () => {
  if (cancelTokenSource) {
    cancelTokenSource.cancel("Requete annulée par l'utilisateur")
  }
}

axiosInstance.interceptors.request.use(
  config => {
    cancelTokenSource = axios.CancelToken.source()
    config.cancelToken = cancelTokenSource.token
    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data'
    } else {
      config.headers['Content-Type'] = 'application/json'
    }

    const accessToken = localStorage.getItem(LocalStorageKeys.ACCESS_TOKEN)
    const refreshToken = localStorage.getItem(LocalStorageKeys.REFRESH_TOKEN)

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    return config
  },
  error => {
    return Promise.reject(error)
  }
)

axiosInstance.interceptors.response.use(
  response => {
    //Ajouter ici les  middlewares

    const { data } = response

    // Si la session a expirée
    if (response.data) {
      if (!data.success && data.message === 'expired_token') {
        alert('Session expirée, veuillez vous ré-identifier')
        localStorage.removeItem(LocalStorageKeys.ACCESS_TOKEN)
        location.reload()
      }
    }

    return response
  },
  error => {
    return Promise.reject(error)
  }
)
