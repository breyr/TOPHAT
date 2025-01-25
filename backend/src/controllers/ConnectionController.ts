import type { Connection } from "@prisma/client";
import type { NextFunction, Response } from "express";
import { DIContainer } from "../config/DIContainer";
import type { AuthenticatedRequest } from '../types/types';

export class ConnectionController {
    private connectionService = DIContainer.getConnectionService();

    async createConnection(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const connectionData = { ...req.body } as Connection;
            const connection = await this.connectionService.createConnection(connectionData);
            res.status(201).json({
                message: 'Connection created successfully',
                data: connection,
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteConnection(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id: connectionId } = req.params;
            const connection = await this.connectionService.deleteConnection(Number(connectionId));
            if (!connection) {
                res.status(404).json({ message: 'Connection not found' });
                return;
            }
            res.status(200).json({
                message: 'Connection deleted successfully',
                data: connection,
            });
        } catch (error) {
            next(error);
        }
    }

    async updateConnection(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id: connectionId } = req.params;
            const connectionData = { ...req.body } as Partial<Connection>;
            const connection = await this.connectionService.updateConnection(Number(connectionId), connectionData);
            if (!connection) {
                res.status(404).json({ message: 'Connection not found' });
                return;
            }
            res.status(200).json({
                message: 'Connection updated successfully',
                data: connection,
            });
        } catch (error) {
            next(error);
        }
    }

    async getAllConnections(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const connections = await this.connectionService.getAllConnections();
            res.status(200).json({
                message: 'Connections retrieved successfully',
                data: connections,
            });
        } catch (error) {
            next(error);
        }
    }

    async getConnectionById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id: connectionId } = req.params;
            const connection = await this.connectionService.getConnectionById(Number(connectionId));
            if (!connection) {
                res.status(404).json({ message: 'Connection not found' });
                return;
            }
            res.status(200).json({
                message: 'Connection retrieved successfully',
                data: connection,
            });
        } catch (error) {
            next(error);
        }
    }

    async getConnectionsByLabDeviceName(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { labDeviceName } = req.params;
            const connections = await this.connectionService.getConnectionsByLabDeviceName(labDeviceName);
            res.status(200).json({
                message: 'Connections retrieved successfully',
                data: connections,
            });
        } catch (error) {
            next(error);
        }
    }

    async getConnectionsByInterconnectDeviceName(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { interconnectDeviceName } = req.params;
            const connections = await this.connectionService.getConnectionsByInterconnectDeviceName(interconnectDeviceName);
            res.status(200).json({
                message: 'Connections retrieved successfully',
                data: connections,
            });
        } catch (error) {
            next(error);
        }
    }
}