import { useEffect, useRef, useState } from 'react'

import type { NotificationDTO } from '../../data/dto/notification'
import type { MessageDTO } from '../../data/dto/message';
import { UseConversation } from '../../context/conversation';

export const useSSE = (userId: string) =>{
  console.log({userId});
  const {pushConversation} = UseConversation()
  
  const [notifications, setNotifications] = useState<NotificationDTO[]>([])
  const [messages, setMessages] = useState<MessageDTO[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!userId) return;

    const url = `${import.meta.env.VITE_BASE_URL}/notification/stream?userId=${userId}`;
    const es = new EventSource(url);

    es.addEventListener('CONNECTED', (e) => {
      const data = JSON.parse(e.data);
      console.log('✅ SSE connecté', data);
      setIsConnected(true);
    });

    es.addEventListener('NEW_CONVERSATION', (e)=>{
      const data = JSON.parse(e.data);
      console.log('✅ New conversation', data);
      pushConversation()
    })

    es.addEventListener('notification', (e) => {
      const notification: NotificationDTO = JSON.parse(e.data);
      setNotifications((prev) => [notification, ...prev]);
    });

    es.addEventListener('new-message', (e) => {
      const message: MessageDTO = JSON.parse(e.data);
      setMessages((prev) => [message, ...prev]);
    });

    es.addEventListener('broadcast', (e) => {
      const broadcast: NotificationDTO = JSON.parse(e.data);
      setNotifications((prev) => [broadcast, ...prev]);
    });

    es.onerror = () => {
      console.error('❌ Erreur SSE');
      setIsConnected(false);
    };

    eventSourceRef.current = es;

    return () => {
      es.close();
      setIsConnected(false);
    };
  }, [userId]);

  return { notifications, messages, isConnected };
}