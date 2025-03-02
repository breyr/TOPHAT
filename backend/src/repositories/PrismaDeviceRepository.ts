import { DeviceType, IconType, PrismaClient, type Device } from "@prisma/client";
import bcrypt from 'bcryptjs';
import { IDeviceRepository } from "../types/classInterfaces";

export class PrismaDeviceRepository implements IDeviceRepository {
    private prisma: PrismaClient;

    constructor(prismaClient: PrismaClient) {
        this.prisma = prismaClient;
    }

    async findDeviceByNumber(deviceNumber: number) {
        return this.prisma.device.findFirst({
            where: { deviceNumber },
        });
    }

    async create(requestData: Device): Promise<Device> {
        // if (requestData.password) {
        //     requestData.password = await bcrypt.hash(requestData.password, 10);
        // }
        // if (requestData.secretPassword) {
        //     requestData.secretPassword = await bcrypt.hash(requestData.secretPassword, 10);
        // }

        const deviceData: any = {
            deviceNumber: requestData.deviceNumber || null,
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
        // if (requestData.password) {
        //     requestData.password = await bcrypt.hash(requestData.password, 10);
        // }
        // if (requestData.secretPassword) {
        //     requestData.secretPassword = await bcrypt.hash(requestData.secretPassword, 10);
        // }
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

    async bookDevice(deviceId: number, userId: number): Promise<Device | null> {
        return await this.prisma.$transaction(async (tx) => {
            // check if device is already booked
            const current = await tx.device.findUnique({
                where: { id: deviceId },
            });

            if (current?.userId && current.userId !== userId) {
                throw new Error("ALREADY_BOOKED");
            } else if (current?.userId === userId) {
                // device is already booked by the same user, return current device
                return current;
            } else {
                // otherwise update the device
                return tx.device.update({
                    where: { id: deviceId },
                    data: { userId }
                });
            }
        });
    }

    async unbookDevice(deviceId: number, userId: number): Promise<Device | null> {
        return await this.prisma.$transaction(async (tx) => {
            // check if device is already booked
            const current = await tx.device.findUnique({
                where: { id: deviceId },
                select: { userId: true }
            });

            // only allow unbooking of device if userIds match
            if (current?.userId !== userId) {
                throw new Error("UNAUTHORIZED");
            }

            // otherwise update the device
            return tx.device.update({
                where: { id: deviceId },
                data: { userId: null }
            });
        });
    }
}