// holds interfaces similar to C#
import { Topology, User } from "@prisma/client";
import type { CreateTopologyRequestPayload, RegisterUserRequestPayload } from "../../../common/shared-types";
import { UpdateTopologyDTO } from "./types";

export interface IUserRepository {
    create(formData: RegisterUserRequestPayload): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findByUsername(username: string): Promise<User | null>;
    delete(id: number): Promise<User | null>;
}

export interface IUserService {
    createUser(formData: RegisterUserRequestPayload): Promise<User>;
    getUserByEmail(email: string): Promise<User | null>;
    getUserByUsername(username: string): Promise<User | null>;
    deleteUser(id: number): Promise<User | null>;
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