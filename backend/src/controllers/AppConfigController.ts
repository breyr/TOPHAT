import type { NextFunction, Response } from "express";
import { DIContainer } from "../config/DIContainer";
import type { AuthenticatedRequest } from '../types/types';

export class AppConfigController {
    private appConfigService = DIContainer.getAppConfigService();

    async updateConfig(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { key } = req.params;
            const { value } = req.body;

            const updatedConfig = await this.appConfigService.updateConfig(key, value);

            res.status(200).json({
                message: 'Config updated successfully',
                data: updatedConfig,
            });
        } catch (error) {
            next(error);
        }
    }

    async getConfigByKey(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { key } = req.params;
            const config = await this.appConfigService.getConfigByKey(key);
            if (!config) {
                res.status(404).json({ message: 'Config not found' });
                return;
            }
            res.status(200).json({
                message: 'Config retrieved successfully',
                data: config,
            });
        } catch (error) {
            next(error);
        }
    }
}