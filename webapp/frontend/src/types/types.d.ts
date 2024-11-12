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
    react_flow_state: {
        nodes: Array<{
            id: string;
            type: string;
            position: { x: number; y: number };
            data: { label: string };
            measured?: { width: number; height: number };
            selected?: boolean;
            dragging?: boolean;
        }>;
        edges: Array<{
            source: string;
            target: string;
            id: string;
        }>;
        viewport: {
            x: number;
            y: number;
            zoom: number;
        };
    };
    expires_on: Date;
    archived: boolean;
    created_at: Date;
    updated_at: Date;
}