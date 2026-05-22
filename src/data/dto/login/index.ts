export interface LoginDTO {
    email: string
    password: string
    deviceInfo? : string
}

export interface GoogleLoginDTO {
    email : string
    family_name : string
    given_name : string
    deviceInfo? : string
    picture?:string
}

export interface SubscribeDTO {
    email: string
    password: string
    firstName: string
    lastName: string
    phoneNumber: string
    birthDate?: string | null
    deviceInfo?: string
}