export type Model = 'multi-tenant' | 'single-user' | null
export type AccountType = 'admin' | 'user'

// the form of the user portion of the JWT payload
export interface UserJwtPayload {
    id: number
    username: string
    email: string
    account_type: AccountType
    exp: number
}
// the response form of topologies from the backend
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
    created_at: string;
    updated_at: string;
}