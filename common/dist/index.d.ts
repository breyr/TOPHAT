export type AccountType = 'USER' | 'ADMIN' | 'OWNER';
export type AccountStatus = 'NOTCREATED' | 'PENDING' | 'ACCEPTED';
export type DeviceType = 'LAB' | 'INTERCONNECT';
export type IconType = 'ROUTER' | 'SWITCH' | 'EXTERNAL' | 'SERVER';
type Node = {
    id: string;
    type: string;
    position: {
        x: number;
        y: number;
    };
    data: {
        label: string;
    };
    measured?: {
        width: number;
        height: number;
    };
    selected?: boolean;
    dragging?: boolean;
};
type Edge = {
    source: string;
    target: string;
    id: string;
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
export interface LoginRequestPayload {
    usernameOrEmail: string;
    password: string;
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
        user?: PartialAppUser;
    };
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
export interface UserJwtPayload {
    id: number;
    username: string;
    email: string;
    accountType: AccountType;
    exp: number;
}
export interface Topology {
    id: number;
    userId: number;
    name: string;
    thumbnail: {
        [key: number]: number;
    } | string;
    reactFlowState: ReactFlowState | null;
    expiresOn: Date;
    archived: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface CreateTopologyRequestPayload {
    name: string;
}
export interface CreateDeviceRequestPayload {
    deviceNumber: 1 | 2;
    userId: number | null;
    topologyId: number | null;
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
export interface LinkRequest {
    interconnect1IP: string;
    interconnect1Prefix: string;
    interconnect2IP: string;
    interconnect2Prefix: string;
    interconnectPortID1: number;
    interconnectPortID2: number;
    username: string;
    password: string;
    secret: string;
}
export interface LinkResponse {
    status: string;
    message: string;
    device1_output: string;
    device2_output: string;
}
export declare enum EmitTypes {
    BookDevice = "BookDevice",
    UnbookDevice = "UnbookDevice"
}
export {};
