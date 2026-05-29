import { urls } from "../../constants/urls";
import type { RoleDTO } from "../../data/dto/role";
import { axiosInstance } from "../utils/axios.utils";

const roleApi = {
  getAllRoles: () => {
    return axiosInstance.get(urls.role.GET_ALL);
  },

  getTables: () => {
    return axiosInstance.get<{ success: boolean; data: string[] }>(urls.role.GET_TABLES);
  },

  createRole: (role: RoleDTO) => {
    return axiosInstance.post(urls.role.CREATE, role);
  },

  updateRole: (id: string, role: RoleDTO) => {
    return axiosInstance.put(urls.role.UPDATE(id), role);
  },

  deleteRole: (id: string) => {
    return axiosInstance.delete(urls.role.DELETE(id));
  },
};

export default roleApi;
