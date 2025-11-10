import { urls } from "../../constants/urls"
import type { ConversationDTO } from "../../data/dto/conversation"
import type { MessageDTO } from "../../data/dto/message"
import { axiosInstance } from "../utils/axios.utils"

const getAllConversation = async ({page=1,limit=20}:{page:number,limit:number})=> {
  const {data} = await axiosInstance.get(urls.conversation.GET_ALL,{params:{page,limit}}).catch((err)=> {throw err})

  return {
    conversations: data.conversations,
    pagination : data.pagination
  }
}

const createConversation = async (conversation : Partial<ConversationDTO>)=>{
  const {data} = await axiosInstance.post(urls.conversation.CREATE,{conversation}).catch((err)=> {throw err})

  return data
}

const sendMessage = async(message : MessageDTO)=>{
  const {data} = await axiosInstance.post(urls.conversation.SEND_MESSAGE,{...message}).catch((err)=> {
    throw err
  })

  return data
}

const getAllMessage = async ({conversationId,page,limit}:{conversationId:string| undefined,page:number,limit:number})=>{
  const {data} = await axiosInstance.get(urls.conversation.GET_ALL_MESSAGE,{params:{conversationId,page,limit}}).catch((err)=> {throw err})

  return {
    messages : data.messages as MessageDTO[],
    pagination : data.pagination
  }
}

export default {
  getAllConversation,
  createConversation,
  sendMessage,
  getAllMessage
}