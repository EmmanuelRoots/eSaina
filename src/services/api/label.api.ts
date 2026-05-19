import { urls } from "../../constants/urls"
import { axiosInstance } from "../utils/axios.utils"

const createLabel = async (payload: { projectId: string, name: string, color: string }) => {
  const { data } = await axiosInstance.post(urls.label.CREATE, payload).catch((err) => { throw err })
  return data.data
}

const listLabels = async (projectId: string) => {
  const { data } = await axiosInstance.get(urls.label.LIST(projectId)).catch((err) => { throw err })
  return data.data
}

const deleteLabel = async (id: string) => {
  await axiosInstance.delete(urls.label.DELETE(id)).catch((err) => { throw err })
}

export default {
  createLabel,
  listLabels,
  deleteLabel
}
