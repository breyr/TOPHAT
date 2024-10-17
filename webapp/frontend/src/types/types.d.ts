export type Model = 'multi-tenant' | 'single-user' | null
export interface UserJwtPaylod {
    id: number
    username: string
    email: string
    account_type: Model
}
export interface AuthApiResponse {
    message?: string
    access_token?: string
    token_type?: string
}