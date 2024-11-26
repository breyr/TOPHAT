import { Prisma, PrismaClient } from "@prisma/client";
import { ITopologyRepository } from "../types/classInterfaces";
import { CreatedTopologyResponse, CreateTopologyDTO, Topology, UpdateTopologyDTO } from "../types/types";

export class PrismaTopologyRepository implements ITopologyRepository {
    private prismaClient: PrismaClient

    constructor(prismaClient: PrismaClient) {
        this.prismaClient = prismaClient
    }

    create(userId: number, requestData: CreateTopologyDTO): Promise<CreatedTopologyResponse> {
        return this.prismaClient.topology.create({
            data: {
                user_id: userId,
                name: requestData.name,
                thumbnail: Buffer.from([0]), // default to empty buffer
                react_flow_state: JSON.stringify({}),
                expires_on: new Date(Date.now() + 6 * 60 * 60 * 1000), // default to 6 hours from now
                archived: false,
            },
            select: {
                id: true,
                name: true,
                expires_on: true
            }
        })
    }

    findAll(userId: number): Promise<Topology[] | null> {
        return this.prismaClient.topology.findMany({
            where: { user_id: userId }
        });
    }

    findOne(userId: number, topologyId: number): Promise<Topology | null> {
        return this.prismaClient.topology.findFirst({
            where: {
                AND: [
                    { user_id: userId },
                    { id: topologyId }
                ]
            }
        });
    }

    update(topologyId: number, topologyData: UpdateTopologyDTO): Promise<Topology> {
        return this.prismaClient.topology.update({
            where: { id: topologyId },
            data: {
                name: topologyData.name ?? Prisma.skip,
                thumbnail: topologyData.thumbnail ? Buffer.from(topologyData.thumbnail, 'base64') : Prisma.skip, // Assuming thumbnail is sent as a base64 string
                react_flow_state: topologyData.react_flow_state ?? Prisma.skip,
                expires_on: topologyData.expires_on ? new Date(topologyData.expires_on) : Prisma.skip,
                archived: topologyData.archived ?? Prisma.skip,
            }
        })
    }

    delete(topologyId: number): Promise<Topology | null> {
        return this.prismaClient.topology.delete({
            where: { id: topologyId }
        })
    }

}