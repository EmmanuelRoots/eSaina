import { createContext, useContext, useState, type JSX } from "react";
import type { ConversationDTO } from "../../data/dto/conversation";
import conversationApi from "../../services/api/conversation.api";
import type { PageResult } from "../../components/infinite-scroll";


interface ConversationAction {
  loadPage : (page: number) => Promise<PageResult<ConversationDTO>>
  conversations : ConversationDTO []
  selectedConversation : ConversationDTO | null
  selectConversation : (conv : ConversationDTO) => void
}

const defaultValue : ConversationAction = {
  loadPage : async () => { return { items: [], hasMore: false } },
  conversations : [],
  selectedConversation : null,
  selectConversation : ()=> {/** */}
}
const conversationContext = createContext<ConversationAction>(defaultValue)

const ConversationProvider = (props: {children: JSX.Element})=> {
  const [conversations,setConversation] = useState<ConversationDTO[]>([])
  const [selectedConversation, setSelectedConversation] = useState<ConversationDTO | null>(null)

  const loadPage =async (page: number) => {
      const res = await conversationApi.getAllConversation({ page, limit: 20 }).catch((err)=> {throw err});
      console.log({res});
      
      setConversation(res.conversations)
      setSelectedConversation(res.conversations[0])
      return { items: res.conversations, hasMore: res.pagination.hasMore };
  }

  const selectConversation = (conv:ConversationDTO)=> {
    console.log('Seleceted conv',conv);
    
    setSelectedConversation(conv)
  }

  return (
    <conversationContext.Provider value={{loadPage, conversations, selectedConversation, selectConversation}}>
      {props.children}
    </conversationContext.Provider>
  )
}

export const UseConversation = () =>useContext(conversationContext)
export default ConversationProvider