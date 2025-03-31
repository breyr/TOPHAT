import type { Device, DeviceType, IconType } from "@prisma/client";
import { EmitTypes } from "common";
import type { NextFunction, Response } from "express";
import { DIContainer } from "../config/DIContainer";
import { io } from "../server";
import type { AuthenticatedRequest } from '../types/types';

export class DeviceController {
    private deviceService = DIContainer.getDeviceService();

    async createDevice(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const deviceData = { ...req.body } as Partial<Device>;

            // this is only for interconnect devices as we only allow 2
            if (deviceData.deviceNumber) {
                const existingDevice = await this.deviceService.findDeviceByNumber(deviceData.deviceNumber);
                if (existingDevice) {
                    res.status(409).json({
                        message: 'Device with this device number already exists',
                    });
                    return;
                }
            }

            const device = await this.deviceService.createDevice(deviceData);
            res.status(201).json({
                message: 'Device created successfully',
                data: device,
            });
        } catch (error) {
            next(error);
        }
    }

    async createDevices(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const devicesData = req.body as Partial<Device>[];
            const devices = await this.deviceService.createDevices(devicesData);
            res.status(201).json({
                message: 'Users created successfully',
                data: devices.map(device => ({ id: device.id })),
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteDevice(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id: deviceId } = req.params;
            const device = await this.deviceService.deleteDevice(Number(deviceId));
            if (!device) {
                res.status(404).json({ message: 'Device not found' });
                return;
            }
            res.status(200).json({
                message: 'Device deleted successfully',
                data: device,
            });
        } catch (error) {
            next(error);
        }
    }

    async updateDevice(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id: deviceId } = req.params;
            const deviceData = { ...req.body } as Partial<Device>;
            const device = await this.deviceService.updateDevice(Number(deviceId), deviceData);
            if (!device) {
                res.status(404).json({ message: 'Device not found' });
                return;
            }
            res.status(200).json({
                message: 'Device updated successfully',
                data: device,
            });
        } catch (error) {
            next(error);
        }
    }

    async getAllDevices(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const devices = await this.deviceService.getAllDevices();
            res.status(200).json({
                message: 'Devices retrieved successfully',
                data: devices,
            });
        } catch (error) {
            next(error);
        }
    }

    async getDeviceById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id: deviceId } = req.params;
            const device = await this.deviceService.getDeviceById(Number(deviceId));
            if (!device) {
                res.status(404).json({ message: 'Device not found' });
                return;
            }
            res.status(200).json({
                message: 'Device retrieved successfully',
                data: device,
            });
        } catch (error) {
            next(error);
        }
    }

    async getDevicesByType(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { deviceType } = req.params;
            const devices = await this.deviceService.getDevicesByType(deviceType as DeviceType);
            res.status(200).json({
                message: 'Devices retrieved successfully',
                data: devices,
            });
        } catch (error) {
            next(error);
        }
    }

    async getDevicesByIcon(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { deviceIcon } = req.params;
            const devices = await this.deviceService.getDevicesByIcon(deviceIcon as IconType);
            res.status(200).json({
                message: 'Devices retrieved successfully',
                data: devices,
            });
        } catch (error) {
            next(error);
        }
    }

    async bookDevice(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            // will have a payload user id otherwise this request is not authenticated through middleware
            const device = await this.deviceService.bookDevice(parseInt(id), req.jwt_payload?.id!);

            // we successfully booked the device
            if (device) {
                io.emit(EmitTypes.BookDevice, {
                    bookedDevice: device
                });
            }
            res.status(200).json(device);
        } catch (error) {
            if (error instanceof Error && error.message === "ALREADY_BOOKED") {
                res.status(409).json({ error: "Device already booked" });
            } else {
                next(error);
            }
        }
    }

    async unbookDevice(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            // will have a payload user id otherwise this request is not authenticated through middleware
            const device = await this.deviceService.unbookDevice(parseInt(id), req.jwt_payload?.id!, req.jwt_payload?.accountType!);

            // we successfully unbooked the device
            if (device) {
                io.emit(EmitTypes.UnbookDevice, {
                    unbookedDevice: device
                });
            }
            res.status(200).json(device);
        } catch (error) {
            if (error instanceof Error && error.message === "UNAUTHORIZED") {
                res.status(401).json({ error: "You are not authorized to unbook this device." });
            } else {
                next(error);
            }
        }
    }
}