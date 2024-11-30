import { NextFunction, Response } from "express";
import { DIContainer } from "../config/DIContainer";
import { AuthenticatedRequest, CreateTopologyDTO, UpdateTopologyDTO } from "../types/types";
import { checkForTopologyId, checkForUserId } from "../utils/validation";

export class TopologyController {
    private topologyService = DIContainer.getTopologyService();

    async createTopology(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const userId = checkForUserId(req);
            const createTopologyDTO = { ...req.body } as CreateTopologyDTO;
            const topology = await this.topologyService.createTopology(userId, createTopologyDTO);
            res.status(201).json({
                message: 'Topology created successfully',
                data: topology
            });
        } catch (error) {
            next(error);
        }
    }

    async getAllTopologies(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const userId = checkForUserId(req);
            const topologies = await this.topologyService.getAllTopologies(userId);
            res.status(200).json({ data: topologies })
        } catch (error) {
            next(error);
        }
    }

    async getTopologyById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const userId = checkForUserId(req);
            const topologyId = checkForTopologyId(req);
            const topology = await this.topologyService.getTopologyById(userId, topologyId);
            if (!topology) {
                res.status(404).json({ message: 'Topology not found' })
            }
            res.status(200).json({ data: topology });
        } catch (error) {
            next(error);
        }
    }

    async updateTopology(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const topologyId = checkForTopologyId(req);
            const updateTopologyDTO = { ...req.body } as UpdateTopologyDTO;
            const topology = await this.topologyService.updateTopology(topologyId, updateTopologyDTO);
            res.status(200).json({ data: topology });
        } catch (error) {
            next(error);
        }
    }

    async deleteTopology(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const topologyId = checkForTopologyId(req);
            const topology = await this.topologyService.deleteTopology(topologyId);
            res.status(200).json({ data: { topologyId } })
        } catch (error) {
            next(error);
        }
    }
}