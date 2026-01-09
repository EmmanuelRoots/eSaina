export interface LoginDTO {
  email: string
  password: string
  deviceInfo?: string
}

export interface GoogleLoginDTO {
  email: string
  family_name: string
  given_name: string
  deviceInfo?: string
  picture?: string
}
