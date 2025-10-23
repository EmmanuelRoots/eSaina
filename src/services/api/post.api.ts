import { urls } from "../../constants/urls"
import type { PostDTO, ReactionDTO } from "../../data/dto/post"
import { axiosInstance } from "../utils/axios.utils"

const getSalonPost = async(salonId:string, page=1, limit=10)=>{
  const {data}= await axiosInstance.get(urls.post.GET_POST_SALON,{params:{salonId,page,limit}}).catch((err)=>{throw err})

  return data
}

const createPost = async(payload:Partial<PostDTO>)=>{
  const {data} = await axiosInstance.post(urls.post.CREATE_POST,payload).catch((err)=>{throw err})

  return data
}

const addRecation = async(payload: ReactionDTO)=>{
  const {data} = await axiosInstance.post(urls.post.ADD_REACTION,payload).catch((err)=>{throw err})

  return data
}

export default {
  getSalonPost,
  createPost,
  addRecation
}