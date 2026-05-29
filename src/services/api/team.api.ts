import { urls } from "../../constants/urls"
import type {
  TeamAddMembersDTO,
  TeamAddProjectsDTO,
  TeamCreateDTO,
  TeamDetailDTO,
  TeamListParams,
  TeamListResponse,
  TeamSummaryDTO,
  TeamUpdateDTO,
  TeamUpdateMemberRoleDTO,
} from "../../data/dto/team"
import { axiosInstance } from "../utils/axios.utils"

const teamApi = {
  list: (params: TeamListParams = {}) => {
    return axiosInstance.get<TeamListResponse>(urls.adminTeam.LIST, { params })
  },

  getById: (id: string) => {
    return axiosInstance.get<{ success: true; data: TeamDetailDTO }>(
      urls.adminTeam.GET_BY_ID(id)
    )
  },

  create: (payload: TeamCreateDTO) => {
    return axiosInstance.post<{ success: true; data: TeamDetailDTO }>(
      urls.adminTeam.CREATE,
      payload
    )
  },

  update: (id: string, payload: TeamUpdateDTO) => {
    return axiosInstance.patch<{ success: true; data: TeamSummaryDTO }>(
      urls.adminTeam.UPDATE(id),
      payload
    )
  },

  remove: (id: string) => {
    return axiosInstance.delete(urls.adminTeam.DELETE(id))
  },

  addMembers: (id: string, payload: TeamAddMembersDTO) => {
    return axiosInstance.post<{ success: true; data: TeamDetailDTO }>(
      urls.adminTeam.ADD_MEMBERS(id),
      payload
    )
  },

  removeMember: (id: string, userId: string) => {
    return axiosInstance.delete<{ success: true; data: TeamDetailDTO }>(
      urls.adminTeam.REMOVE_MEMBER(id, userId)
    )
  },

  updateMemberRole: (id: string, userId: string, payload: TeamUpdateMemberRoleDTO) => {
    return axiosInstance.patch<{ success: true; data: TeamDetailDTO }>(
      urls.adminTeam.UPDATE_MEMBER_ROLE(id, userId),
      payload
    )
  },

  addProjects: (id: string, payload: TeamAddProjectsDTO) => {
    return axiosInstance.post<{ success: true; data: TeamDetailDTO }>(
      urls.adminTeam.ADD_PROJECTS(id),
      payload
    )
  },

  removeProject: (id: string, projectId: string) => {
    return axiosInstance.delete<{ success: true; data: TeamDetailDTO }>(
      urls.adminTeam.REMOVE_PROJECT(id, projectId)
    )
  },

  searchProjects: (params: { search?: string; limit?: number } = {}) => {
    return axiosInstance.get<{
      success: true
      data: Array<{ id: string; key: string; name: string }>
    }>(urls.adminTeam.SEARCH_PROJECTS, { params })
  },
}

export default teamApi
