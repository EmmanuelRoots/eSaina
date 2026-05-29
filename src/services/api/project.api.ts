import { urls } from "../../constants/urls"
import type { CreateProjectRequestDTO, ProjectDTO, ProjectStatusDTO, UpdateProjectRequestDTO } from "../../data/dto/project"
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

const getProjectStatuses = async (projectId: string): Promise<ProjectStatusDTO[]> => {
  const { data } = await axiosInstance.get(urls.projectStatus.LIST(projectId)).catch((err) => { throw err })
  return data.data
}

const createProjectStatus = async (projectId: string, payload: Partial<ProjectStatusDTO>): Promise<ProjectStatusDTO> => {
  const { data } = await axiosInstance.post(urls.projectStatus.CREATE(projectId), payload).catch((err) => { throw err })
  return data.data
}

const updateProjectStatus = async (statusId: string, payload: Partial<ProjectStatusDTO>): Promise<ProjectStatusDTO> => {
  const { data } = await axiosInstance.patch(urls.projectStatus.UPDATE(statusId), payload).catch((err) => { throw err })
  return data.data
}

const deleteProjectStatus = async (statusId: string): Promise<void> => {
  await axiosInstance.delete(urls.projectStatus.DELETE(statusId)).catch((err) => { throw err })
}

const reorderProjectStatuses = async (projectId: string, statusIds: string[]): Promise<void> => {
  await axiosInstance.post(urls.projectStatus.REORDER(projectId), { statusIds }).catch((err) => { throw err })
}

export default {
  getMyProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getBoard,
  getBacklog,
  getProjectStatuses,
  createProjectStatus,
  updateProjectStatus,
  deleteProjectStatus,
  reorderProjectStatuses
}
