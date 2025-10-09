import { urls } from "../../constants/urls"
import type { ConversationDTO } from "../../data/dto/conversation"
import { axiosInstance } from "../utils/axios.utils"

const getAllConversation = async ({page=1,limit=20}:{page:number,limit:number})=> {
  const {data} = await axiosInstance.get(urls.conversation.GET_ALL,{params:{page,limit}}).catch((err)=> {throw err})

  return {
    conversations: data.conversations,
    pagination : data.pagination
  }
}

const createConversation = async (conversation : Partial<ConversationDTO>)=>{
  const {data} = await axiosInstance.post(urls.conversation.CREATE,{conversation})

  return data
}

export default {
  getAllConversation,
  createConversation
}