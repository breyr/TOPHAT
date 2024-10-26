export type Model = 'multi-tenant' | 'single-user' | null
export type AccountType = 'admin' | 'user'
export interface UserJwtPaylod {
    id: number
    username: string
    email: string
    account_type: AccountType
    exp: number
}
export interface AuthApiResponse {
    message?: string
    access_token?: string
    token_type?: string
}
export interface Topology {
    id: number;
    user_id: number;
    name: string;
    thumbnail: Buffer;
    react_flow_state: any; // Use a more specific type if you know the structure of the JSON
    expires_on: Date;
    archived: boolean;
}