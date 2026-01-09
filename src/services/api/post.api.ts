import { urls } from '../../constants/urls'
import type { CommentDTO, PostDTO, ReactionDTO } from '../../data/dto/post'
import { axiosInstance } from '../utils/axios.utils'

const getSalonPost = async (salonId: string, page = 1, limit = 10) => {
  const { data } = await axiosInstance
    .get(urls.post.GET_POST_SALON, { params: { salonId, page, limit } })
    .catch(err => {
      throw err
    })

  return data
}

const createPost = async (payload: Partial<PostDTO>) => {
  const { data } = await axiosInstance
    .post(urls.post.CREATE_POST, payload)
    .catch(err => {
      throw err
    })

  return data
}

const addRecation = async (payload: Partial<ReactionDTO>) => {
  const { data } = await axiosInstance
    .post(urls.post.ADD_REACTION, payload)
    .catch(err => {
      throw err
    })

  return data
}

const deleteReaction = async (reactionId: string) => {
  const { data } = await axiosInstance
    .delete(urls.post.DELETE_REACTION, { params: { reactionId } })
    .catch(err => {
      throw err
    })

  return data
}

const createComment = async (payload: Partial<CommentDTO>) => {
  const { data } = await axiosInstance
    .post(urls.post.CREATE_COMMENT, payload)
    .catch(err => {
      throw err
    })

  return data
}

const getComments = async (postId: string) => {
  const { data } = await axiosInstance
    .get(urls.post.GET_COMMENTS, { params: { postId } })
    .catch(err => {
      throw err
    })

  return data
}

export default {
  getSalonPost,
  createPost,
  addRecation,
  deleteReaction,
  createComment,
  getComments,
}
