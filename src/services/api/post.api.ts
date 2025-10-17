import { urls } from "../../constants/urls"
import { axiosInstance } from "../utils/axios.utils"

const getSalonPost = async(salonId:string)=>{
  const {data}= await axiosInstance.get(urls.post.GET_POST_SALON,{params:{salonId}}).catch((err)=>{throw err})

  return data
}

export default {
  getSalonPost
}