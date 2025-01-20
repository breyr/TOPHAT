// TYPES
//
export type AccountType = 'USER' | 'ADMIN' | 'OWNER' // owner should only be used when creating the owner account
export type AccountStatus = 'NOTCREATED' | 'PENDING' | 'ACCEPTED'
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
        user?: PartialAppUser
    }
}
export interface PartialAppUser {
    id: number;
    username: string;
    email: string;
    password: string;
    tempPassword: string;
    accountType: AccountType;
    accountStatus: AccountStatus;
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
// this interface is only used on client side
export interface Topology {
    id: number;
    userId: number;
    name: string;
    thumbnail: { [key: number]: number } | string; // receive | send
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
    icon: IconType | null;
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


// Connection DTOs
//
export interface Connection {
    id?: number;
    labDeviceName: string;
    labDevicePort: string;
    interconnectDeviceName: string;
    interconnectDevicePort: string;
}

export interface CreateConnectionRequestPayload {
    labDeviceName: string;
    labDevicePort: string;
    interconnectDeviceName: string;
    interconnectDevicePort: string;
}

export interface UpdateConnectionRequestPayload {
    labDeviceName?: string;
    labDevicePort?: string;
    interconnectDeviceName?: string;
    interconnectDevicePort?: string;
}