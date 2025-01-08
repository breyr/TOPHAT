import { DeviceType, IconType, PrismaClient, type Device } from "@prisma/client";
import bcrypt from 'bcryptjs';
import { IDeviceRepository } from "../types/classInterfaces";

export class PrismaDeviceRepository implements IDeviceRepository {
    private prisma: PrismaClient;

    constructor(prismaClient: PrismaClient) {
        this.prisma = prismaClient;
    }

    async create(requestData: Device): Promise<Device> {
        if (requestData.password) {
            requestData.password = await bcrypt.hash(requestData.password, 10);
        }
        if (requestData.secretPassword) {
            requestData.secretPassword = await bcrypt.hash(requestData.secretPassword, 10);
        }

        const deviceData: any = {
            userId: requestData.userId || null,
            topologyId: requestData.topologyId || null,
            name: requestData.name,
            model: requestData.model,
            serialNumber: requestData.serialNumber,
            ipAddress: requestData.ipAddress || null,
            description: requestData.description || null,
            password: requestData.password || null,
            username: requestData.username || null,
            secretPassword: requestData.secretPassword || null,
            ports: requestData.ports,
            type: requestData.type,
            icon: requestData.icon?.toUpperCase() || null,
        };

        return this.prisma.device.create({
            data: deviceData,
        });
    }

    async delete(deviceId: number): Promise<Device | null> {
        return this.prisma.device.delete({
            where: { id: deviceId },
        });
    }

    async update(deviceId: number, requestData: Partial<Device>): Promise<Device> {
        if (requestData.password) {
            requestData.password = await bcrypt.hash(requestData.password, 10);
        }
        if (requestData.secretPassword) {
            requestData.secretPassword = await bcrypt.hash(requestData.secretPassword, 10);
        }
        return this.prisma.device.update({
            where: { id: deviceId },
            data: requestData,
        });
    }

    async findAll(): Promise<Device[]> {
        return this.prisma.device.findMany();
    }

    async findById(deviceId: number): Promise<Device | null> {
        return this.prisma.device.findUnique({
            where: { id: deviceId },
        });
    }

    async findByType(deviceType: DeviceType): Promise<Device[]> {
        return this.prisma.device.findMany({
            where: { type: deviceType },
        });
    }

    async findByIcon(deviceIcon: IconType): Promise<Device[]> {
        return this.prisma.device.findMany({
            where: { icon: deviceIcon },
        });
    }
}