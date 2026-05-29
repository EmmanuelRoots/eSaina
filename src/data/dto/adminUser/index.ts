import type { RoleDTO } from "../role";

export interface AdminUserListItemDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  birthDate?: string | null;
  pdpUrl?: string;
  active: boolean;
  createdAt: string;
  roleId: string;
  role?: RoleDTO;
}

export interface AdminUserListResponse {
  success: true;
  data: AdminUserListItemDTO[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface AdminUserUpdateDTO {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  birthDate?: string | null;
  roleId?: string;
  active?: boolean;
}

export interface AdminUserListParams {
  page?: number;
  limit?: number;
  search?: string;
  roleId?: string;
  active?: boolean;
}
