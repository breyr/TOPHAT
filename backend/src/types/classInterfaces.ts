// holds interfaces similar to C#
import { AppConfig, AppUser, Connection, Device, DeviceType, IconType, Topology } from "@prisma/client";
import type { CreateConnectionRequestPayload, CreateTopologyRequestPayload, RegisterUserRequestPayload } from "../../../common/src/index";
import { UpdateTopologyDTO } from "./types";

export interface IUserRepository {
    create(formData: RegisterUserRequestPayload): Promise<Partial<AppUser>>;
    findByEmail(email: string): Promise<AppUser | null>;
    findByUsername(username: string): Promise<AppUser | null>;
    findById(id: number): Promise<AppUser | null>;
    changePassword(id: number, newPassword: string): Promise<AppUser | null>;
    delete(id: number): Promise<Partial<AppUser> | null>;
    getAll(): Promise<Partial<AppUser>[]>;
    update(id: number, data: Partial<AppUser>): Promise<Partial<AppUser>>;
}

export interface IUserService {
    createUser(formData: RegisterUserRequestPayload): Promise<Partial<AppUser>>;
    getUserByEmail(email: string): Promise<AppUser | null>;
    getUserByUsername(username: string): Promise<AppUser | null>;
    getUserById(id: number): Promise<AppUser | null>;
    getAllUsers(): Promise<Partial<AppUser>[]>;
    changePassword(id: number, newPassword: string): Promise<AppUser | null>;
    deleteUser(id: number): Promise<Partial<AppUser> | null>;
    updateUser(id: number, data: Partial<AppUser>): Promise<Partial<AppUser>>;
}

export interface ITopologyRepository {
    create(userId: number, requestData: CreateTopologyRequestPayload): Promise<Topology>;
    findAll(userId: number): Promise<Topology[] | null>;
    findOne(userId: number, topologyId: number): Promise<Topology | null>;
    update(topologyId: number, topologyData: UpdateTopologyDTO): Promise<Topology>;
    delete(topologyId: number): Promise<Topology | null>;
}

export interface ITopologyService {
    createTopology(userId: number, requestData: CreateTopologyRequestPayload): Promise<Topology>;
    getAllTopologies(userId: number): Promise<Topology[] | null>;
    getTopologyById(userId: number, topologyId: number): Promise<Topology | null>;
    updateTopology(topologyId: number, topologyData: UpdateTopologyDTO): Promise<Topology>;
    deleteTopology(topologyId: number): Promise<Topology | null>;
}

export interface IDeviceRepository {
    findDeviceByNumber(deviceNumber: number): Promise<Device | null>;
    create(requestData: Device): Promise<Device>;
    delete(deviceId: number): Promise<Device | null>;
    update(deviceId: number, requestData: Partial<Device>): Promise<Device>;
    findAll(): Promise<Device[]>;
    findById(deviceId: number): Promise<Device | null>;
    findByType(deviceType: DeviceType): Promise<Device[]>;
    findByIcon(deviceIcon: IconType): Promise<Device[]>;
}

export interface IDeviceService {
    findDeviceByNumber(deviceNumber: number): Promise<Device | null>;
    createDevice(requestData: Partial<Device>): Promise<Device>;
    createDevices(requestData: Partial<Device>[]): Promise<Device[]>;
    deleteDevice(deviceId: number): Promise<Device | null>;
    updateDevice(deviceId: number, requestData: Partial<Device>): Promise<Device>;
    getAllDevices(): Promise<Device[]>;
    getDeviceById(deviceId: number): Promise<Device | null>;
    getDevicesByType(deviceType: DeviceType): Promise<Device[]>;
    getDevicesByIcon(deviceIcon: IconType): Promise<Device[]>;
}

export interface IConnectionRepository {
    create(requestData: Connection): Promise<Connection>;
    createBulk(requestData: Partial<Connection>[]): Promise<Connection[]>;
    delete(connectionId: number): Promise<Connection | null>;
    deleteBulk(requestData: Connection[]): Promise<{ count: number }>;
    update(connectionId: number, requestData: Partial<Connection>): Promise<Connection>;
    updateBulk(requestData: Connection[]): Promise<Connection[]>;
    findAll(): Promise<Connection[]>;
    findById(connectionId: number): Promise<Connection | null>;
    findByLabDeviceName(labDeviceName: string): Promise<Connection[]>;
    findByInterconnectDeviceName(interconnectDeviceName: string): Promise<Connection[]>;
}

export interface IConnectionService {
    createConnection(requestData: Connection): Promise<Connection>;
    createConnectionBulk(requestData: Partial<Connection>[]): Promise<Connection[]>;
    deleteConnection(connectionId: number): Promise<Connection | null>;
    deleteConnectionBulk(requestData: Connection[]): Promise<{ count: number }>;
    updateConnection(connectionId: number, requestData: Partial<Connection>): Promise<Connection>;
    updateConnectionBulk(requestData: Connection[]): Promise<Connection[]>;
    getAllConnections(): Promise<Connection[]>;
    getConnectionById(connectionId: number): Promise<Connection | null>;
    getConnectionsByLabDeviceName(labDeviceName: string): Promise<Connection[]>;
    getConnectionsByInterconnectDeviceName(interconnectDeviceName: string): Promise<Connection[]>;
}

export interface IAppConfigRepository {
    findByKey(key: string): Promise<AppConfig | null>;
    upsertConfig(key: string, value: string): Promise<AppConfig>;
}

export interface IAppConfigService {
    updateConfig(key: string, value: string): Promise<AppConfig>;
    getConfigByKey(key: string): Promise<AppConfig | null>;
}