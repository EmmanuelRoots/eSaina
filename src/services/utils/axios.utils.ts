import axios, { type AxiosInstance } from 'axios';
import { LocalStorageKeys } from '../../constants/storage.constant';
import { urls } from '../../constants/urls';

export const axiosInstance: AxiosInstance = axios.create({
  timeout: 30000,
  baseURL: import.meta.env.VITE_BASE_URL,
});

/**
 * Mutex de refresh : évite la race condition quand plusieurs requêtes
 * reçoivent un 401 simultanément (token expiré). Une seule requête de
 * refresh tourne à la fois ; les autres attendent sa résolution et
 * réutilisent les nouveaux tokens sans déclencher un second refresh.
 */
let refreshingPromise: Promise<{ accessToken: string; refreshToken: string }> | null = null;

/* ----------  REQUEST  ---------- */
axiosInstance.interceptors.request.use(
  config => {
    const accessToken = localStorage.getItem(LocalStorageKeys.ACCESS_TOKEN);
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

/* ----------  RESPONSE  ---------- */
axiosInstance.interceptors.response.use(
  res => res,
  async err => {
    const orig = err.config;

    // 1. 401 et pas déjà retry
    if (err.response?.status === 401 && !orig._retry) {
      orig._retry = true;
      const refreshToken = localStorage.getItem(LocalStorageKeys.REFRESH_TOKEN);

      if (!refreshToken) return Promise.reject(err); // pas de refresh → laisse tomber

      try {
        // 2. Si un refresh est déjà en cours, attendre son résultat plutôt
        //    que d'en déclencher un second (évite la race sur la rotation)
        if (!refreshingPromise) {
          refreshingPromise = axios
            .post(
              `${axiosInstance.defaults.baseURL}${urls.user.REFRESH_TOKEN}`,
              { refreshToken },
              { headers: { 'Content-Type': 'application/json' } }
            )
            .then(res => res.data)
            .finally(() => { refreshingPromise = null; });
        }

        const { accessToken: newAccess, refreshToken: newRefresh } = await refreshingPromise;

        // 3. Sauvegarde
        localStorage.setItem(LocalStorageKeys.ACCESS_TOKEN, newAccess);
        localStorage.setItem(LocalStorageKeys.REFRESH_TOKEN, newRefresh);

        // 4. Rejoue la requête initiale avec le nouveau token
        orig.headers.Authorization = `Bearer ${newAccess}`;
        return axiosInstance(orig);
      } catch (refreshErr) {
        // Refresh raté → vrai logout
        console.error('[auth] refresh échoué, déconnexion', refreshErr);
        localStorage.removeItem(LocalStorageKeys.ACCESS_TOKEN);
        localStorage.removeItem(LocalStorageKeys.REFRESH_TOKEN);
        location.reload();
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(err);
  }
);