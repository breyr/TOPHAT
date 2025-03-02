import type { Device, DeviceType, IconType } from "@prisma/client";
import { IDeviceRepository, IDeviceService } from "../types/classInterfaces";

export class DeviceService implements IDeviceService {
    private deviceRepository: IDeviceRepository;

    constructor(deviceRepository: IDeviceRepository) {
        this.deviceRepository = deviceRepository;
    }

    async findDeviceByNumber(deviceNumber: number) {
        return this.deviceRepository.findDeviceByNumber(deviceNumber);
    }

    async createDevices(requestData: Partial<Device>[]): Promise<Device[]> {
        if (!requestData || !Array.isArray(requestData)) {
            throw new Error("Invalid input data");
        }

        const createdDevices: Device[] = [];
        for (const deviceData of requestData) {
            const createdDevice = await this.deviceRepository.create(deviceData as Device);
            createdDevices.push(createdDevice);
        }

        return createdDevices;
    }

    async createDevice(requestData: Device): Promise<Device> {
        return this.deviceRepository.create(requestData);
    }

    async deleteDevice(deviceId: number): Promise<Device | null> {
        return this.deviceRepository.delete(deviceId);
    }

    async updateDevice(deviceId: number, requestData: Partial<Device>): Promise<Device> {
        return this.deviceRepository.update(deviceId, requestData);
    }

    async getAllDevices(): Promise<Device[]> {
        return this.deviceRepository.findAll();
    }

    async getDeviceById(deviceId: number): Promise<Device | null> {
        return this.deviceRepository.findById(deviceId);
    }

    async getDevicesByType(deviceType: DeviceType): Promise<Device[]> {
        return this.deviceRepository.findByType(deviceType);
    }

    async getDevicesByIcon(deviceIcon: IconType): Promise<Device[]> {
        return this.deviceRepository.findByIcon(deviceIcon);
    }

    async bookDevice(deviceId: number, userId: number): Promise<Device | null> {
        return this.deviceRepository.bookDevice(deviceId, userId);
    }
}