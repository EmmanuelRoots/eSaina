import { urls } from "../../constants/urls"
import type { CreateProjectRequestDTO, ProjectDTO, UpdateProjectRequestDTO } from "../../data/dto/project"
import { axiosInstance } from "../utils/axios.utils"

const getMyProjects = async (): Promise<ProjectDTO[]> => {
  const { data } = await axiosInstance.get(urls.project.MINE).catch((err) => { throw err })
  return data.data
}

const getProjectById = async (id: string): Promise<ProjectDTO> => {
  const { data } = await axiosInstance.get(urls.project.GET_BY_ID(id)).catch((err) => { throw err })
  return data.data
}

const createProject = async (payload: CreateProjectRequestDTO): Promise<ProjectDTO> => {
  const { data } = await axiosInstance.post(urls.project.CREATE, payload).catch((err) => { throw err })
  return data.data
}

const updateProject = async (id: string, payload: UpdateProjectRequestDTO): Promise<ProjectDTO> => {
  const { data } = await axiosInstance.patch(urls.project.UPDATE(id), payload).catch((err) => { throw err })
  return data.data
}

const deleteProject = async (id: string): Promise<void> => {
  await axiosInstance.delete(urls.project.DELETE(id)).catch((err) => { throw err })
}

const getBoard = async (id: string) => {
  const { data } = await axiosInstance.get(urls.project.GET_BOARD(id)).catch((err) => { throw err })
  return data.data
}

const getBacklog = async (id: string) => {
  const { data } = await axiosInstance.get(urls.project.GET_BACKLOG(id)).catch((err) => { throw err })
  return data.data
}

export default {
  getMyProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getBoard,
  getBacklog
}
