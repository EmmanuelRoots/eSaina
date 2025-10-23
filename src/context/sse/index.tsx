import { createContext, useContext, useEffect, useState, type JSX } from "react"
import { UseAuth } from "../user"
import { UseConversation } from "../conversation"
import type { NotificationDTO } from "../../data/dto/notification"
import type { PostDTO } from "../../data/dto/post"

type SSEContextProps = {
  isConnected :  boolean
  newMessage : number
  notifications : Partial<NotificationDTO>[]
  newPost? : PostDTO
}

const defaultValue:SSEContextProps = {
  isConnected : false,
  newMessage : 0,
  notifications:[] as Partial<NotificationDTO>[],
}

const SSEContext = createContext<SSEContextProps>(defaultValue)

const SSEProvider = (props: { children: JSX.Element })=>{
  const {user} = UseAuth()
  const {pushConversation} = UseConversation()
  const [isConnected,setIsConnected] = useState<boolean>(false)
  const [newMessage, setNewMessage] = useState<number>(0)
  const [newPost, setNewPost] = useState<PostDTO | undefined>()
  const [notifications, setNotifications] = useState<Partial<NotificationDTO>[]>([] as Partial<NotificationDTO>[])

  useEffect(()=>{
    if (!user?.id) return
    const url = `${import.meta.env.VITE_BASE_URL}/notification/stream?userId=${user?.id}`
    const es = new EventSource(url)
    es.addEventListener('CONNECTED', (e) => {
      const data = JSON.parse(e.data)
      console.log('✅ SSE connecté', data)
      setIsConnected(true);
    })

    es.addEventListener('NEW_MESSAGE', (e) => {
      const data = JSON.parse(e.data);
      console.log('✅ New message', data);
      setNewMessage(prev=>prev+1)
      //const message: MessageDTO = JSON.parse(e.data);
      //setMessages((prev) => [message, ...prev]);
    });

    es.addEventListener('NEW_CONVERSATION', (e)=>{
      const data = JSON.parse(e.data);
      console.log('✅ New conversation', data)
      pushConversation()
    })
    
    es.addEventListener('BROADCAST', (e) => {
      const broadcast = JSON.parse(e.data)
      console.log('✅ New notification', broadcast)
      const post = broadcast.post 
      setNotifications((prev) => [broadcast, ...prev])
      if(broadcast.type === 'NEW_POST'){
        setNewPost(post)
      }
    });
    
    return () => {
      console.log('❌  SSE deconnected');
      es.close();
      setIsConnected(false);
    }
  },[user])

  return (
    <SSEContext.Provider value={{isConnected, newMessage, notifications, newPost}}>
      {props.children}
    </SSEContext.Provider>
  )
}

export default SSEProvider
export const UseSSE = ()=> useContext(SSEContext)