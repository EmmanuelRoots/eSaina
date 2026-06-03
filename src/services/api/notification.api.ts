/**
 * Service API pour les notifications persistées.
 *
 * Rôle : accès REST aux endpoints notification (lecture, marquage comme lu).
 * Toutes les requêtes passent par l'instance axios partagée qui gère
 * l'injection du Bearer token et le refresh automatique.
 *
 * Dépendances : axiosInstance, urls.notification, StoredNotificationDTO.
 */
import { urls } from '../../constants/urls'
import type { StoredNotificationDTO } from '../../data/dto/notification'
import { axiosInstance } from '../utils/axios.utils'

/**
 * Récupère les N dernières notifications de l'utilisateur, triées par date décroissante.
 *
 * @param userId - Identifiant de l'utilisateur connecté.
 * @param limit  - Nombre maximum de notifications à retourner (défaut : 20).
 * @returns Liste des notifications persistées.
 */
const getNotifications = async (userId: string, limit = 20): Promise<StoredNotificationDTO[]> => {
  const { data } = await axiosInstance.get(urls.notification.LIST, { params: { userId, limit } })
  return data.data as StoredNotificationDTO[]
}

/**
 * Marque une notification spécifique comme lue.
 *
 * @param notificationId - Identifiant de la notification.
 * @param userId         - Identifiant de l'utilisateur (ownership check côté serveur).
 */
const markAsRead = async (notificationId: string, userId: string): Promise<void> => {
  await axiosInstance.patch(
    urls.notification.MARK_AS_READ(notificationId),
    null,
    { params: { userId } },
  )
}

/**
 * Marque toutes les notifications non lues de l'utilisateur comme lues.
 *
 * @param userId - Identifiant de l'utilisateur connecté.
 */
const markAllAsRead = async (userId: string): Promise<void> => {
  await axiosInstance.patch(urls.notification.MARK_ALL_READ, null, { params: { userId } })
}

export default { getNotifications, markAsRead, markAllAsRead }
