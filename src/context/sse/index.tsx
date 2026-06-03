/**
 * Contexte SSE (Server-Sent Events).
 *
 * Ouvre une connexion SSE vers `/notification/stream` dès que l'utilisateur
 * est authentifié. Le JWT est transmis via le query param `token` car
 * l'API EventSource native ne supporte pas les en-têtes HTTP personnalisés.
 *
 * Expose également :
 * - `storedNotifications` : liste des notifications persistées (chargées au
 *    mount + enrichies en temps réel via les events ISSUE_*).
 * - `unreadCount` : nombre de notifications non lues.
 * - `markAsRead(id)` / `markAllAsRead()` : actions de lecture.
 *
 * Dépendances : UseAuth, UseConversation, notificationApi.
 */
import { createContext, useCallback, useContext, useEffect, useState, type JSX } from 'react'
import { UseAuth } from '../user'
import { UseConversation } from '../conversation'
import type { NotificationDTO, StoredNotificationDTO } from '../../data/dto/notification'
import type { PostDTO } from '../../data/dto/post'
import { LocalStorageKeys } from '../../constants/storage.constant'
import notificationApi from '../../services/api/notification.api'
import { requestNotificationPermission, showBrowserNotification } from '../../utils/browserNotification'

type SSEContextProps = {
  isConnected: boolean
  newMessage: number
  /** Notifications broadcast (ancienne liste temps-réel, conservée pour compatibilité). */
  notifications: Partial<NotificationDTO>[]
  newPost?: PostDTO
  /** Notifications persistées chargées depuis l'API + enrichies en temps réel. */
  storedNotifications: StoredNotificationDTO[]
  /** Nombre de notifications non lues. */
  unreadCount: number
  /** Marque une notification spécifique comme lue. */
  markAsRead: (notificationId: string) => Promise<void>
  /** Marque toutes les notifications non lues comme lues. */
  markAllAsRead: () => Promise<void>
}

const defaultValue: SSEContextProps = {
  isConnected: false,
  newMessage: 0,
  notifications: [],
  storedNotifications: [],
  unreadCount: 0,
  markAsRead: async () => { /* no-op */ },
  markAllAsRead: async () => { /* no-op */ },
}

const SSEContext = createContext<SSEContextProps>(defaultValue)

/**
 * Fournit le contexte SSE à toutes les routes privées.
 * La connexion est ouverte dès que `user.id` est disponible et
 * fermée automatiquement au démontage.
 *
 * @param props.children - Arbre de composants enfants.
 */
const SSEProvider = (props: { children: JSX.Element }) => {
  const { user } = UseAuth()
  const { pushConversation } = UseConversation()
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [newMessage, setNewMessage] = useState<number>(0)
  const [newPost, setNewPost] = useState<PostDTO | undefined>()
  const [notifications, setNotifications] = useState<Partial<NotificationDTO>[]>([])
  const [storedNotifications, setStoredNotifications] = useState<StoredNotificationDTO[]>([])

  const unreadCount = storedNotifications.filter((n) => !n.read).length

  /** Charge les 20 dernières notifications depuis l'API au montage. */
  useEffect(() => {
    if (!user?.id) return
    notificationApi.getNotifications(user.id, 20)
      .then((notifs) => setStoredNotifications(notifs))
      .catch(() => { /* échec silencieux — la liste sera enrichie en temps réel */ })
  }, [user?.id])

  /** Marque une notification comme lue localement puis via l'API. */
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user?.id) return
    setStoredNotifications((prev) =>
      prev.map((n) => n.id === notificationId ? { ...n, read: true } : n)
    )
    await notificationApi.markAsRead(notificationId, user.id).catch(() => {
      // Rollback optimiste en cas d'erreur réseau
      setStoredNotifications((prev) =>
        prev.map((n) => n.id === notificationId ? { ...n, read: false } : n)
      )
    })
  }, [user?.id])

  /** Marque toutes les notifications non lues comme lues localement puis via l'API. */
  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return
    setStoredNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    await notificationApi.markAllAsRead(user.id).catch(() => {
      // Rollback : recharge depuis l'API
      notificationApi.getNotifications(user.id!, 20)
        .then((notifs) => setStoredNotifications(notifs))
        .catch(() => { /* silence */ })
    })
  }, [user?.id])

  /** Demande la permission de notification navigateur dès que l'utilisateur est connecté. */
  useEffect(() => {
    if (!user?.id) return
    void requestNotificationPermission()
  }, [user?.id])

  /** Connexion SSE + gestion des événements temps réel. */
  useEffect(() => {
    if (!user?.id) return

    // Le JWT est passé en query param car EventSource ne supporte pas les headers custom.
    const token = localStorage.getItem(LocalStorageKeys.ACCESS_TOKEN)
    if (!token) return

    const url = `${import.meta.env.VITE_BASE_URL}/notification/stream?userId=${user.id}&token=${encodeURIComponent(token)}`
    const es = new EventSource(url)

    es.addEventListener('CONNECTED', (e) => {
      setIsConnected(true)
      void e
    })

    es.addEventListener('NEW_MESSAGE', (e: MessageEvent) => {
      setNewMessage((prev) => prev + 1)
      try {
        const payload = JSON.parse(e.data) as StoredNotificationDTO
        showBrowserNotification({
          title: payload.title ?? 'Nouveau message',
          body: payload.message ?? '',
          tag: 'new-message',
        })
      } catch {
        showBrowserNotification({ title: 'Nouveau message', body: '', tag: 'new-message' })
      }
    })

    es.addEventListener('NEW_CONVERSATION', () => {
      pushConversation()
      showBrowserNotification({
        title: 'Nouvelle conversation',
        body: 'Une conversation a été partagée avec vous.',
        tag: 'new-conversation',
      })
    })

    es.addEventListener('BROADCAST', (e) => {
      const broadcast = JSON.parse(e.data)
      setNotifications((prev) => [broadcast, ...prev])
      if (broadcast.type === 'NEW_POST') {
        setNewPost(broadcast.post)
        showBrowserNotification({
          title: broadcast.title ?? 'Nouveau post',
          body: broadcast.message ?? '',
          tag: 'new-post',
        })
      } else {
        showBrowserNotification({
          title: broadcast.title ?? 'Notification',
          body: broadcast.message ?? '',
          tag: 'broadcast',
        })
      }
    })

    /**
     * Ajoute une notification issue en tête de la liste persistée
     * et affiche une notification navigateur avec son.
     */
    const handleIssueEvent = (e: MessageEvent) => {
      const payload = JSON.parse(e.data) as StoredNotificationDTO
      setStoredNotifications((prev) => [payload, ...prev])
      showBrowserNotification({
        title: payload.title,
        body: payload.message,
        tag: payload.id,
      })
    }

    es.addEventListener('ISSUE_ASSIGNED', handleIssueEvent)
    es.addEventListener('ISSUE_STATUS_CHANGED', handleIssueEvent)
    es.addEventListener('ISSUE_COMMENTED', handleIssueEvent)
    es.addEventListener('ISSUE_UPDATED', handleIssueEvent)

    return () => {
      es.close()
      setIsConnected(false)
    }
  }, [user])

  return (
    <SSEContext.Provider value={{
      isConnected,
      newMessage,
      notifications,
      newPost,
      storedNotifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
    }}>
      {props.children}
    </SSEContext.Provider>
  )
}

export default SSEProvider
export const UseSSE = () => useContext(SSEContext)
