import { urls } from "../../constants/urls"
import type { CreateIssueCommentRequestDTO, CreateIssueRequestDTO, IssueCommentDTO, IssueDTO, UpdateIssueRequestDTO } from "../../data/dto/issue"
import { axiosInstance } from "../utils/axios.utils"

const createIssue = async (payload: CreateIssueRequestDTO): Promise<IssueDTO> => {
  const { data } = await axiosInstance.post(urls.issue.CREATE, payload).catch((err) => { throw err })
  return data.data
}

const listIssues = async (projectId: string): Promise<IssueDTO[]> => {
  const { data } = await axiosInstance.get(urls.issue.LIST(projectId)).catch((err) => { throw err })
  return data.data
}

const getIssueById = async (id: string): Promise<IssueDTO> => {
  const { data } = await axiosInstance.get(urls.issue.GET_BY_ID(id)).catch((err) => { throw err })
  return data.data
}

const updateIssue = async (id: string, payload: UpdateIssueRequestDTO): Promise<IssueDTO> => {
  const { data } = await axiosInstance.patch(urls.issue.UPDATE(id), payload).catch((err) => { throw err })
  return data.data
}

const deleteIssue = async (id: string): Promise<void> => {
  await axiosInstance.delete(urls.issue.DELETE(id)).catch((err) => { throw err })
}

const addComment = async (payload: CreateIssueCommentRequestDTO): Promise<IssueCommentDTO> => {
  const { data } = await axiosInstance.post(urls.issue.ADD_COMMENT, payload).catch((err) => { throw err })
  return data.data
}

const getComments = async (id: string): Promise<IssueCommentDTO[]> => {
  const { data } = await axiosInstance.get(urls.issue.GET_COMMENTS(id)).catch((err) => { throw err })
  return data.data
}

export default {
  createIssue,
  listIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
  addComment,
  getComments
}
