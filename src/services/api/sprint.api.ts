import { urls } from "../../constants/urls"
import type { CreateSprintRequestDTO, SprintDTO, UpdateSprintRequestDTO } from "../../data/dto/sprint"
import { axiosInstance } from "../utils/axios.utils"

const createSprint = async (payload: CreateSprintRequestDTO): Promise<SprintDTO> => {
  const { data } = await axiosInstance.post(urls.sprint.CREATE, payload).catch((err) => { throw err })
  return data.data
}

const listSprints = async (projectId: string): Promise<SprintDTO[]> => {
  const { data } = await axiosInstance.get(urls.sprint.LIST(projectId)).catch((err) => { throw err })
  return data.data
}

const updateSprint = async (id: string, payload: UpdateSprintRequestDTO): Promise<SprintDTO> => {
  const { data } = await axiosInstance.patch(urls.sprint.UPDATE(id), payload).catch((err) => { throw err })
  return data.data
}

const startSprint = async (id: string): Promise<SprintDTO> => {
  const { data } = await axiosInstance.post(urls.sprint.START(id)).catch((err) => { throw err })
  return data.data
}

const closeSprint = async (id: string): Promise<SprintDTO> => {
  const { data } = await axiosInstance.post(urls.sprint.CLOSE(id)).catch((err) => { throw err })
  return data.data
}

const deleteSprint = async (id: string): Promise<void> => {
  await axiosInstance.delete(urls.sprint.DELETE(id)).catch((err) => { throw err })
}

export default {
  createSprint,
  listSprints,
  updateSprint,
  startSprint,
  closeSprint,
  deleteSprint
}
