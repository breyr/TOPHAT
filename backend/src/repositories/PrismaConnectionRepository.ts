import { PrismaClient, type Connection } from "@prisma/client";
import { IConnectionRepository } from "../types/classInterfaces";

export class PrismaConnectionRepository implements IConnectionRepository {
    private prisma: PrismaClient;

    constructor(prismaClient: PrismaClient) {
        this.prisma = prismaClient;
    }

    async updateBulk(requestData: Connection[]): Promise<Connection[]> {
        // use transaction to ensure all updates succeed or none do
        return this.prisma.$transaction(async (tx) => {
            const updatedConnections: Connection[] = [];

            for (const data of requestData) {
                const updated = await tx.connection.update({
                    where: { id: data.id },
                    data: {
                        labDeviceName: data.labDeviceName,
                        labDevicePort: data.labDevicePort,
                        interconnectDeviceName: data.interconnectDeviceName,
                        interconnectDevicePort: data.interconnectDevicePort,
                    },
                });
                updatedConnections.push(updated);
            }

            return updatedConnections;
        });
    }

    async createBulk(requestData: Connection[]): Promise<Connection[]> {
        return this.prisma.connection.createManyAndReturn({
            data: requestData
        })
    }

    async deleteBulk(requestData: Connection[]): Promise<{ count: number }> {
        if (!Array.isArray(requestData)) {
            throw new Error("requestData should be an array");
        }

        const ids = requestData.map(connection => connection.id);

        return this.prisma.connection.deleteMany({
            where: {
                id: {
                    in: ids
                }
            }
        });
    }

    async create(requestData: Connection): Promise<Connection> {
        return this.prisma.connection.create({
            data: requestData,
        });
    }

    async delete(connectionId: number): Promise<Connection | null> {
        return this.prisma.connection.delete({
            where: { id: connectionId },
        });
    }

    async update(connectionId: number, requestData: Partial<Connection>): Promise<Connection> {
        return this.prisma.connection.update({
            where: { id: connectionId },
            data: requestData,
        });
    }

    async findAll(): Promise<Connection[]> {
        return this.prisma.connection.findMany({
            orderBy: {
                id: 'asc'
            }
        });
    }

    async findById(connectionId: number): Promise<Connection | null> {
        return this.prisma.connection.findUnique({
            where: { id: connectionId },
        });
    }

    async findByLabDeviceName(labDeviceName: string): Promise<Connection[]> {
        return this.prisma.connection.findMany({
            where: { labDeviceName },
        });
    }

    async findByInterconnectDeviceName(interconnectDeviceName: string): Promise<Connection[]> {
        return this.prisma.connection.findMany({
            where: { interconnectDeviceName },
        });
    }
}