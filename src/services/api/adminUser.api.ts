import { urls } from "../../constants/urls";
import type {
  AdminUserListParams,
  AdminUserListResponse,
  AdminUserUpdateDTO,
} from "../../data/dto/adminUser";
import { axiosInstance } from "../utils/axios.utils";

const adminUserApi = {
  list: (params: AdminUserListParams = {}) => {
    return axiosInstance.get<AdminUserListResponse>(urls.adminUser.LIST, {
      params,
    });
  },

  update: (id: string, payload: AdminUserUpdateDTO) => {
    return axiosInstance.patch(urls.adminUser.UPDATE(id), payload);
  },

  resetPassword: (id: string, password: string) => {
    return axiosInstance.post(urls.adminUser.RESET_PASSWORD(id), { password });
  },

  deactivate: (id: string) => {
    return axiosInstance.delete(urls.adminUser.DELETE(id));
  },
};

export default adminUserApi;
