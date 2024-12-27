// TYPES
//
export type AccountType = 'user' | 'admin'
export type Model = 'multi-tenant' | 'single-user' | null
type Node = {
    id: string;
    type: string;
    position: { x: number; y: number };
    data: { label: string };
    measured?: { width: number; height: number };
    selected?: boolean;
    dragging?: boolean;
};
type Edge = {
    source: string;
    target: string;
    id: string
};
type Viewport = {
    x: number;
    y: number;
    zoom: number;
};
export type ReactFlowState = {
    nodes: Array<Node>;
    edges: Array<Edge>;
    viewport: Viewport;
};

// User DTOs
//
export interface LoginRequestPayload {
    usernameOrEmail: string
    password: string
}
export interface LoginResponsePayload {
    message: string;
    data: {
        token: string;
    };
}
export interface RegisterUserRequestPayload {
    username: string;
    email: string;
    password: string;
    account_type: AccountType;
}
export interface RegisterUserResponsePayload {
    message: string;
    data: {
        id: number;
    }
}
// this is more of an interface for the frontend project
export interface UserJwtPayload {
    id: number
    username: string
    email: string
    account_type: AccountType
    exp: number
}

// Topology DTOs
//
export interface Topology {
    name: string;
    id: number;
    created_at: Date;
    updated_at: Date;
    user_id: number;
    thumbnail: Buffer;
    react_flow_state: ReactFlowState | null;
    expires_on: Date;
    archived: boolean;
}
export interface CreateTopologyRequestPayload {
    name: string;
}
