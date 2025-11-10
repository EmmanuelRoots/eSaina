export interface AuthorizationDto {
  tableName: string
  create: boolean
  read: boolean
  update: boolean
  delete: boolean
  visibleFields: string[]
  // ajoutez ici les propriétés que vous stockez dans le JSON
  [key: string]: unknown;
}
export interface RoleDTO {
  id? : string
  name : string
  authorizations : AuthorizationDto[]
}