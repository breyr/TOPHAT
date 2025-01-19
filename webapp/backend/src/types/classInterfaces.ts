// holds interfaces similar to C#
import { AppUser, Connection, Device, DeviceType, IconType, Topology } from "@prisma/client";
import type { CreateTopologyRequestPayload, RegisterUserRequestPayload } from "../../../common/shared-types";
import { UpdateTopologyDTO } from "./types";

export interface IUserRepository {
    create(formData: RegisterUserRequestPayload): Promise<AppUser>;
    findByEmail(email: string): Promise<AppUser | null>;
    findByUsername(username: string): Promise<AppUser | null>;
    findById(id: number): Promise<AppUser | null>;
    delete(id: number): Promise<AppUser | null>;
    changePassword(id: number, newPassword: string): Promise<AppUser | null>;
    getAll(): Promise<Partial<AppUser>[]>;
}

export interface IUserService {
    createUser(formData: RegisterUserRequestPayload): Promise<AppUser>;
    createUsers(formData: RegisterUserRequestPayload[]): Promise<AppUser[]>;
    getUserByEmail(email: string): Promise<AppUser | null>;
    getUserByUsername(username: string): Promise<AppUser | null>;
    getUserById(id: number): Promise<AppUser | null>;
    getAllUsers(): Promise<Partial<AppUser>[]>;
    deleteUser(id: number): Promise<AppUser | null>;
    changePassword(id: number, newPassword: string): Promise<AppUser | null>;
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
    create(requestData: Device): Promise<Device>;
    delete(deviceId: number): Promise<Device | null>;
    update(deviceId: number, requestData: Partial<Device>): Promise<Device>;
    findAll(): Promise<Device[]>;
    findById(deviceId: number): Promise<Device | null>;
    findByType(deviceType: DeviceType): Promise<Device[]>;
    findByIcon(deviceIcon: IconType): Promise<Device[]>;
}

export interface IDeviceService {
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
    delete(connectionId: number): Promise<Connection | null>;
    update(connectionId: number, requestData: Partial<Connection>): Promise<Connection>;
    findAll(): Promise<Connection[]>;
    findById(connectionId: number): Promise<Connection | null>;
    findByLabDeviceName(labDeviceName: string): Promise<Connection[]>;
    findByInterconnectDeviceName(interconnectDeviceName: string): Promise<Connection[]>;
}

export interface IConnectionService {
    createConnection(requestData: Connection): Promise<Connection>;
    deleteConnection(connectionId: number): Promise<Connection | null>;
    updateConnection(connectionId: number, requestData: Partial<Connection>): Promise<Connection>;
    getAllConnections(): Promise<Connection[]>;
    getConnectionById(connectionId: number): Promise<Connection | null>;
    getConnectionsByLabDeviceName(labDeviceName: string): Promise<Connection[]>;
    getConnectionsByInterconnectDeviceName(interconnectDeviceName: string): Promise<Connection[]>;
}