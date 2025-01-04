// holds interfaces similar to C#
import { AppUser, Device, DeviceType, IconType, Topology } from "@prisma/client";
import type { CreateTopologyRequestPayload, RegisterUserRequestPayload } from "../../../common/shared-types";
import { UpdateTopologyDTO } from "./types";

export interface IUserRepository {
    create(formData: RegisterUserRequestPayload): Promise<AppUser>;
    findByEmail(email: string): Promise<AppUser | null>;
    findByUsername(username: string): Promise<AppUser | null>;
    delete(id: number): Promise<AppUser | null>;
}

export interface IUserService {
    createUser(formData: RegisterUserRequestPayload): Promise<AppUser>;
    getUserByEmail(email: string): Promise<AppUser | null>;
    getUserByUsername(username: string): Promise<AppUser | null>;
    deleteUser(id: number): Promise<AppUser | null>;
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
    deleteDevice(deviceId: number): Promise<Device | null>;
    updateDevice(deviceId: number, requestData: Partial<Device>): Promise<Device>;
    getAllDevices(): Promise<Device[]>;
    getDeviceById(deviceId: number): Promise<Device | null>;
    getDevicesByType(deviceType: DeviceType): Promise<Device[]>;
    getDevicesByIcon(deviceIcon: IconType): Promise<Device[]>;
}