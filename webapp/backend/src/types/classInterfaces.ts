// holds interfaces similar to C#
import { CreatedTopologyResponse, CreateTopologyDTO, CreateUserDTO, Topology, UpdateTopologyDTO, UserResponse } from "./types";

export interface IUserRepository {
    create(formData: CreateUserDTO): Promise<UserResponse>;
    findByEmail(email: string): Promise<UserResponse | null>;
    findByUsername(username: string): Promise<UserResponse | null>;
    delete(id: number): Promise<UserResponse | null>;
}

export interface IUserService {
    createUser(formData: CreateUserDTO): Promise<UserResponse>;
    getUserByEmail(email: string): Promise<UserResponse | null>;
    getUserByUsername(username: string): Promise<UserResponse | null>;
    deleteUser(id: number): Promise<UserResponse | null>;
}

export interface ITopologyRepository {
    create(userId: number, requestData: CreateTopologyDTO): Promise<CreatedTopologyResponse>;
    findAll(userId: number): Promise<Topology[] | null>;
    findOne(userId: number, topologyId: number): Promise<Topology | null>;
    update(topologyId: number, topologyData: UpdateTopologyDTO): Promise<Topology>;
    delete(topologyId: number): Promise<Topology | null>;
}

export interface ITopologyService {
    createTopology(userId: number, requestData: CreateTopologyDTO): Promise<CreatedTopologyResponse>;
    getAllTopologies(userId: number): Promise<Topology[] | null>;
    getTopologyById(userId: number, topologyId: number): Promise<Topology | null>;
    updateTopology(topologyId: number, topologyData: UpdateTopologyDTO): Promise<Topology>;
    deleteTopology(topologyId: number): Promise<Topology | null>;
}