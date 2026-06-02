/**
 * Contexte SSE (Server-Sent Events).
 *
 * Ouvre une connexion SSE vers `/notification/stream` dès que l'utilisateur
 * est authentifié. Le JWT est transmis via le query param `token` car
 * l'API EventSource native ne supporte pas les en-têtes HTTP personnalisés.
 *
 * Dépendances : UseAuth (user + token), UseConversation (pushConversation).
 */
import { createContext, useContext, useEffect, useState, type JSX } from 'react'
import { UseAuth } from '../user'
import { UseConversation } from '../conversation'
import type { NotificationDTO } from '../../data/dto/notification'
import type { PostDTO } from '../../data/dto/post'
import { LocalStorageKeys } from '../../constants/storage.constant'

type SSEContextProps = {
  isConnected: boolean
  newMessage: number
  notifications: Partial<NotificationDTO>[]
  newPost?: PostDTO
}

const defaultValue: SSEContextProps = {
  isConnected: false,
  newMessage: 0,
  notifications: [] as Partial<NotificationDTO>[],
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
  const [notifications, setNotifications] = useState<Partial<NotificationDTO>[]>(
    [] as Partial<NotificationDTO>[]
  )

  useEffect(() => {
    if (!user?.id) return

    // Le JWT est passé en query param car EventSource ne supporte pas les headers custom.
    const token = localStorage.getItem(LocalStorageKeys.ACCESS_TOKEN)
    if (!token) return

    const url = `${import.meta.env.VITE_BASE_URL}/notification/stream?userId=${user.id}&token=${encodeURIComponent(token)}`
    const es = new EventSource(url)

    es.addEventListener('CONNECTED', (e) => {
      setIsConnected(true)
      // Log retiré : évite de logguer des données utilisateur en production
      void e
    })

    es.addEventListener('NEW_MESSAGE', () => {
      setNewMessage((prev) => prev + 1)
    })

    es.addEventListener('NEW_CONVERSATION', () => {
      pushConversation()
    })

    es.addEventListener('BROADCAST', (e) => {
      const broadcast = JSON.parse(e.data)
      setNotifications((prev) => [broadcast, ...prev])
      if (broadcast.type === 'NEW_POST') {
        setNewPost(broadcast.post)
      }
    })

    return () => {
      es.close()
      setIsConnected(false)
    }
  }, [user])

  return (
    <SSEContext.Provider value={{ isConnected, newMessage, notifications, newPost }}>
      {props.children}
    </SSEContext.Provider>
  )
}

export default SSEProvider
export const UseSSE = () => useContext(SSEContext)
