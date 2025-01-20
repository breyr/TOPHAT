import { PrismaClient, type Connection } from "@prisma/client";
import { IConnectionRepository } from "../types/classInterfaces";

export class PrismaConnectionRepository implements IConnectionRepository {
    private prisma: PrismaClient;

    constructor(prismaClient: PrismaClient) {
        this.prisma = prismaClient;
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
        return this.prisma.connection.findMany();
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