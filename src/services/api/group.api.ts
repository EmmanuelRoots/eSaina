import { urls } from "../../constants/urls"
import type {
  GroupAddMembersDTO,
  GroupCreateDTO,
  GroupDetailDTO,
  GroupListParams,
  GroupListResponse,
  GroupSummaryDTO,
  GroupUpdateDTO,
  GroupUpdateMemberRoleDTO,
} from "../../data/dto/group"
import { axiosInstance } from "../utils/axios.utils"

const groupApi = {
  list: (params: GroupListParams = {}) => {
    return axiosInstance.get<GroupListResponse>(urls.adminGroup.LIST, { params })
  },

  getById: (id: string) => {
    return axiosInstance.get<{ success: true; data: GroupDetailDTO }>(
      urls.adminGroup.GET_BY_ID(id)
    )
  },

  create: (payload: GroupCreateDTO) => {
    return axiosInstance.post<{ success: true; data: GroupDetailDTO }>(
      urls.adminGroup.CREATE,
      payload
    )
  },

  update: (id: string, payload: GroupUpdateDTO) => {
    return axiosInstance.patch<{ success: true; data: GroupSummaryDTO }>(
      urls.adminGroup.UPDATE(id),
      payload
    )
  },

  remove: (id: string) => {
    return axiosInstance.delete(urls.adminGroup.DELETE(id))
  },

  addMembers: (id: string, payload: GroupAddMembersDTO) => {
    return axiosInstance.post<{ success: true; data: GroupDetailDTO }>(
      urls.adminGroup.ADD_MEMBERS(id),
      payload
    )
  },

  removeMember: (id: string, userId: string) => {
    return axiosInstance.delete<{ success: true; data: GroupDetailDTO }>(
      urls.adminGroup.REMOVE_MEMBER(id, userId)
    )
  },

  updateMemberRole: (id: string, userId: string, payload: GroupUpdateMemberRoleDTO) => {
    return axiosInstance.patch<{ success: true; data: GroupDetailDTO }>(
      urls.adminGroup.UPDATE_MEMBER_ROLE(id, userId),
      payload
    )
  },
}

export default groupApi
