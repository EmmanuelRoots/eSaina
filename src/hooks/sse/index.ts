/**
 * Hook SSE (Server-Sent Events).
 *
 * Variante hook (vs contexte) pour les composants qui ont besoin d'écouter
 * les événements SSE sans passer par le contexte global.
 * Le JWT est transmis via query param `token`.
 *
 * Dépendances : UseAuth, UseConversation, localStorage.
 */
import { useEffect, useRef, useState } from 'react'

import type { NotificationDTO } from '../../data/dto/notification'
import type { MessageDTO } from '../../data/dto/message'
import { UseConversation } from '../../context/conversation'
import { UseAuth } from '../../context/user'
import { LocalStorageKeys } from '../../constants/storage.constant'

/**
 * Ouvre une connexion SSE authentifiée et expose les événements reçus.
 *
 * @returns notifications, messages, isConnected, newMessage
 */
export const useSSE = () => {
  const { pushConversation } = UseConversation()
  const { user } = UseAuth()

  const [notifications, setNotifications] = useState<NotificationDTO[]>([])
  const [messages, setMessages] = useState<MessageDTO[]>([])
  const [newMessage, setNewMessage] = useState<number>(0)
  const [isConnected, setIsConnected] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!user?.id) return

    // Le JWT est passé en query param car EventSource ne supporte pas les headers custom.
    const token = localStorage.getItem(LocalStorageKeys.ACCESS_TOKEN)
    if (!token) return

    const url = `${import.meta.env.VITE_BASE_URL}/notification/stream?userId=${user.id}&token=${encodeURIComponent(token)}`
    const es = new EventSource(url)

    es.addEventListener('CONNECTED', () => {
      setIsConnected(true)
    })

    es.addEventListener('NEW_CONVERSATION', () => {
      pushConversation()
    })

    es.addEventListener('notification', (e) => {
      const notification: NotificationDTO = JSON.parse(e.data)
      setNotifications((prev) => [notification, ...prev])
    })

    es.addEventListener('NEW_MESSAGE', (e) => {
      setNewMessage((prev) => prev + 1)
      const message: MessageDTO = JSON.parse(e.data)
      setMessages((prev) => [message, ...prev])
    })

    es.addEventListener('BROADCAST', (e) => {
      const broadcast: NotificationDTO = JSON.parse(e.data)
      setNotifications((prev) => [broadcast, ...prev])
    })

    es.onerror = () => {
      setIsConnected(false)
    }

    eventSourceRef.current = es

    return () => {
      es.close()
      setIsConnected(false)
    }
  }, [user])

  return { notifications, messages, isConnected, newMessage }
}
