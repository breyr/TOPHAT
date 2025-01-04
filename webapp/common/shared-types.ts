// TYPES
//
export type AccountType = 'USER' | 'ADMIN'
export type DeviceType = 'LAB' | 'INTERCONNECT'
export type IconType = 'ROUTER' | 'SWITCH' | 'EXTERNAL' | 'SERVER'
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
    accountType: AccountType;
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
    accountType: AccountType
    exp: number
}

// Topology DTOs
//
export interface Topology {
    id: number;
    userId: number;
    name: string;
    thumbnail: Buffer;
    reactFlowState: ReactFlowState | null;
    expiresOn: Date;
    archived: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface CreateTopologyRequestPayload {
    name: string;
}

// Device DTOs
//
export interface Device {
    id: number;
    userId: number;
    topologyId: number;
    name: string;
    model: string;
    serialNumber: string;
    ipAddress: string | null;
    description: string | null;
    password: string | null;
    username: string | null;
    secretPassword: string | null;
    ports: string;
    type: DeviceType;
    icon: IconType;
}

export interface CreateDeviceRequestPayload {
    userId: number;
    topologyId: number;
    name: string;
    model: string;
    serialNumber: string;
    ipAddress: string | null;
    description: string | null;
    password: string | null;
    username: string | null;
    secretPassword: string | null;
    ports: string;
    type: DeviceType;
    icon: IconType;
}

export interface UpdateDeviceRequestPayload {
    name?: string;
    model?: string;
    serialNumber?: string;
    ipAddress?: string | null;
    description?: string | null;
    password?: string | null;
    username?: string | null;
    secretPassword?: string | null;
    ports?: string;
    type?: DeviceType;
    icon?: IconType;
}
