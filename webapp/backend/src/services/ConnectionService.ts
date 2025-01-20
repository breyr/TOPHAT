import type { Connection } from "@prisma/client";
import { IConnectionRepository, IConnectionService } from "../types/classInterfaces";

export class ConnectionService implements IConnectionService {
    private connectionRepository: IConnectionRepository;

    constructor(connectionRepository: IConnectionRepository) {
        this.connectionRepository = connectionRepository;
    }

    async createConnection(requestData: Connection): Promise<Connection> {
        return this.connectionRepository.create(requestData);
    }

    async deleteConnection(connectionId: number): Promise<Connection | null> {
        return this.connectionRepository.delete(connectionId);
    }

    async updateConnection(connectionId: number, requestData: Partial<Connection>): Promise<Connection> {
        return this.connectionRepository.update(connectionId, requestData);
    }

    async getAllConnections(): Promise<Connection[]> {
        return this.connectionRepository.findAll();
    }

    async getConnectionById(connectionId: number): Promise<Connection | null> {
        return this.connectionRepository.findById(connectionId);
    }

    async getConnectionsByLabDeviceName(labDeviceName: string): Promise<Connection[]> {
        return this.connectionRepository.findByLabDeviceName(labDeviceName);
    }

    async getConnectionsByInterconnectDeviceName(interconnectDeviceName: string): Promise<Connection[]> {
        return this.connectionRepository.findByInterconnectDeviceName(interconnectDeviceName);
    }
}