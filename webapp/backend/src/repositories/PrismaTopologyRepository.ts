import { Prisma, PrismaClient, type Topology } from "@prisma/client";
import type { CreateTopologyRequestPayload, ReactFlowState } from "../../../common/shared-types";
import { ITopologyRepository } from "../types/classInterfaces";
import { UpdateTopologyDTO } from "../types/types";

export class PrismaTopologyRepository implements ITopologyRepository {
    private prismaClient: PrismaClient

    constructor(prismaClient: PrismaClient) {
        this.prismaClient = prismaClient;
    }

    // static helper method to convert react_flow_state (JsonValue) to ReactFlowState
    private static convertReactFlowState(json: Prisma.JsonValue): ReactFlowState | null {
        if (json && typeof json === 'object') {
            return json as ReactFlowState;
        }
        return null;
    }

    create(userId: number, requestData: CreateTopologyRequestPayload): Promise<Topology> {
        return this.prismaClient.topology.create({
            data: {
                userId,
                name: requestData.name,
                thumbnail: Buffer.from([0]), // default to empty buffer
                reactFlowState: JSON.stringify({}), // Store as JSON string in database
                expiresOn: new Date(Date.now() + 6 * 60 * 60 * 1000), // default to 6 hours from now
                archived: false,
            }
        }).then((topology) => {
            return {
                ...topology,
                reactFlowState: PrismaTopologyRepository.convertReactFlowState(topology.reactFlowState)
            };
        });
    }

    findAll(userId: number): Promise<Topology[] | null> {
        return this.prismaClient.topology.findMany({
            where: { userId }
        }).then((topologies) => {
            return topologies?.map((topology) => {
                return {
                    ...topology,
                    reactFlowState: PrismaTopologyRepository.convertReactFlowState(topology.reactFlowState)
                };
            }) || null;
        });
    }

    findOne(userId: number, topologyId: number): Promise<Topology | null> {
        return this.prismaClient.topology.findFirst({
            where: {
                AND: [
                    { userId },
                    { id: topologyId }
                ]
            }
        }).then((topology) => {
            if (!topology) return null;
            return {
                ...topology,
                reactFlowState: PrismaTopologyRepository.convertReactFlowState(topology.reactFlowState)
            };
        });
    }

    update(topologyId: number, topologyData: UpdateTopologyDTO): Promise<Topology> {
        return this.prismaClient.topology.update({
            where: { id: topologyId },
            data: {
                name: topologyData.name ?? Prisma.skip,
                thumbnail: topologyData.thumbnail ? Buffer.from(topologyData.thumbnail, 'base64') : Prisma.skip, // Assuming thumbnail is sent as a base64 string
                reactFlowState: topologyData.react_flow_state ?? Prisma.skip,
                expiresOn: topologyData.expires_on ? new Date(topologyData.expires_on) : Prisma.skip,
                archived: topologyData.archived ?? Prisma.skip,
            }
        }).then((topology) => {
            return {
                ...topology,
                reactFlowState: PrismaTopologyRepository.convertReactFlowState(topology.reactFlowState)
            };
        });
    }

    delete(topologyId: number): Promise<Topology | null> {
        return this.prismaClient.topology.delete({
            where: { id: topologyId }
        }).then((topology) => {
            if (!topology) return null;
            return {
                ...topology,
                reactFlowState: PrismaTopologyRepository.convertReactFlowState(topology.reactFlowState)
            };
        });
    }
}
