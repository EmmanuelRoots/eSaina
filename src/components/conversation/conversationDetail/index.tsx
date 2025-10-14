import { UseConversation } from "../../../context/conversation"
import { MessageType, SenderType, type MessageDTO } from "../../../data/dto/message";
import type { FieldConfig } from "../../../interfaces/components/form";
import Column from "../../column"
import Row from "../../row";
import GenericForm from "../../form";
import { ConversationType, type ConversationDTO } from "../../../data/dto/conversation";
import { UseAuth } from "../../../context/user";
import type { UserDTO } from "../../../data/dto/user";
import conversationApi from "../../../services/api/conversation.api";
import { useCallback, useEffect, useState } from "react";
import { useSSE } from "../../../hooks/sse";
import { InfiniteScroll } from "../../infinite-scroll";
import { MessageItem } from "../../message";

export const ConversationDetail = ()=> {
  const {selectedConversation} = UseConversation()
  const [loading, setLoading] = useState<boolean>(false)
  const [messages, setMessages] = useState<MessageDTO[]>([])
  const [hasMore, setHasMore] = useState<boolean>(false)
  const [page, setPage] = useState<number>(1);
  const {user} = UseAuth()
  const {newMessage} = useSSE(user?.id??'')
  const fields : FieldConfig<Partial<MessageDTO>>[] = [{
    name : 'content',
    type : 'text',
    label: ''
  }]

  const initialValues:Partial<MessageDTO> = {
    content:''
  }

  const handleSubmit = (content:string | undefined)=>{
    setLoading(true)
    if(content) {
      const newMessage:MessageDTO = {
        content : content,
        conversation : selectedConversation as ConversationDTO,
        sender : SenderType.USER,
        type : MessageType.TEXT,
        user : user as UserDTO
      }

      if(selectedConversation?.type === ConversationType.AI_CHAT){
        setMessages(prev=>[newMessage,...prev])
      }
      
      conversationApi.sendMessage(newMessage).then(res=>{
        console.log({res});
        setLoading(false)
        fetchMessages(selectedConversation?.id ?? '')
      }).catch(err=>{
        console.error(err)
      }).finally(()=>{
        setLoading(false)
      })
      
    }
  }

  const loadMore = useCallback(async ()=>{
    setPage(prev => prev + 1)
    const realPage=page+1
    console.log('--- call this ---',loading)

    if (loading) return { items: [], hasMore }

    setLoading(true);
    console.log({page});
    
    const { messages: fetched, pagination } = await conversationApi.getAllMessage({conversationId:selectedConversation?.id,page:realPage,limit:20}).finally(()=>setLoading(false))  
    setMessages(prev => [...prev, ...fetched]);
    
    setHasMore(pagination.hasMore)
  },[])

  const fetchMessages = useCallback(async (conversationId:string)=>{
    setLoading(true)
    const res = await conversationApi.getAllMessage({conversationId:conversationId,page:page,limit:20}).finally(()=>setLoading(false))
    setMessages(res.messages)
    setHasMore(res.pagination.hasMore)
  },[])
 
  useEffect(()=>{
    console.log('there is a new message',{newMessage});
    if(newMessage>0){
      fetchMessages(selectedConversation?.id || "")
    }
    
  },[newMessage])


  useEffect(()=>{
    fetchMessages(selectedConversation?.id || "")
  },[selectedConversation])
  

  return (
    <Column>
        <Column style={{height:"80vh", gap:8}}>
          <InfiniteScroll
            items={messages}
            hasMore ={hasMore}
            loadMore={loadMore}
            renderItem={(c)=>(<MessageItem key={c.id} {...c}/>)}
            loading={loading}
            direction="top"
          />
        </Column>
      <Row style={{justifyContent:"flex-end"}}>
      {loading && (<p>loading...</p>)}
        <GenericForm 
          fields={fields}
          initialValues={initialValues}
          onSubmit={(res)=>handleSubmit(res.content)}
          style={{display:"flex", gap:8}}
        />
      </Row>
    </Column>
  )
}