export type Model = 'multi-tenant' | 'single-user' | null
export type AccountType = 'admin' | 'user'

// reference from backend response type
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    error?: Error;
}
export interface UserJwtPayload {
    id: number
    username: string
    email: string
    account_type: AccountType
    exp: number
}
export interface Topology {
    id: number;
    user_id: number;
    name: string;
    thumbnail: Buffer;
    react_flow_state: any; // Use a more specific type if you know the structure of the JSON
    expires_on: Date;
    archived: boolean;
    created_at: Date;
    updated_at: Date;
}