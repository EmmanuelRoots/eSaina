import axios, { type AxiosInstance } from 'axios'
import { LocalStorageKeys } from '../../constants/storage.constant'
import { urls } from '../../constants/urls'

export const axiosInstance: AxiosInstance = axios.create({
  timeout: 30000,
  baseURL: import.meta.env.VITE_BASE_URL,
})

/* ----------  REQUEST  ---------- */
axiosInstance.interceptors.request.use(
  config => {
    const accessToken = localStorage.getItem(LocalStorageKeys.ACCESS_TOKEN)
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  error => Promise.reject(error)
)

/* ----------  RESPONSE  ---------- */
axiosInstance.interceptors.response.use(
  res => res,
  async err => {
    const orig = err.config

    // 1. 401 et pas déjà retry
    if (err.response?.status === 401 && !orig._retry) {
      orig._retry = true
      const refreshToken = localStorage.getItem(LocalStorageKeys.REFRESH_TOKEN)

      if (!refreshToken) return Promise.reject(err) // pas de refresh → laisse tomber

      try {
        // 2. Demande nouvelle paire
        const { data } = await axios.post(
          `${axiosInstance.defaults.baseURL}${urls.user.REFRESH_TOKEN}`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        )

        const { accessToken: newAccess, refreshToken: newRefresh } = data

        // 3. Sauvegarde
        localStorage.setItem(LocalStorageKeys.ACCESS_TOKEN, newAccess)
        localStorage.setItem(LocalStorageKeys.REFRESH_TOKEN, newRefresh)

        // 4. Rejoue la requête initiale
        orig.headers.Authorization = `Bearer ${newAccess}`

        return axiosInstance(orig)
      } catch (refreshErr) {
        // refresh raté → vrai logout

        console.error(refreshErr)
        localStorage.removeItem(LocalStorageKeys.ACCESS_TOKEN)
        localStorage.removeItem(LocalStorageKeys.REFRESH_TOKEN)
        location.reload() // ou redirect /login
        //throw refreshErr
        return Promise.reject(refreshErr)
      }
    }

    return Promise.reject(err)
  }
)
