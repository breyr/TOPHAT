import { PrismaClient } from "@prisma/client";
import { PrismaDeviceRepository } from "../repositories/PrismaDeviceRepository";
import { PrismaTopologyRepository } from "../repositories/PrismaTopologyRepository";
import { PrismaUserRepository } from "../repositories/PrismaUserRepository";
import { DeviceService } from "../services/DeviceService";
import { TopologyService } from "../services/TopologyService";
import { UserService } from "../services/UserService";
import { IDeviceRepository, IDeviceService, ITopologyRepository, ITopologyService, IUserRepository, IUserService } from "../types/classInterfaces";

export class DIContainer {
    private static prismaClient: PrismaClient;
    private static userRepository: IUserRepository;
    private static userService: IUserService;
    private static topologyRepository: ITopologyRepository;
    private static topologyService: ITopologyService;
    private static deviceRepository: IDeviceRepository;
    private static deviceService: IDeviceService;

    static initialize() {
        this.prismaClient = this.prismaClient || new PrismaClient();
        this.userRepository = new PrismaUserRepository(this.prismaClient)
        this.userService = new UserService(this.userRepository);
        this.topologyRepository = new PrismaTopologyRepository(this.prismaClient);
        this.topologyService = new TopologyService(this.topologyRepository);
        this.deviceRepository = new PrismaDeviceRepository(this.prismaClient);
        this.deviceService = new DeviceService(this.deviceRepository);
    }

    static getUserService(): IUserService {
        if (!this.userService) {
            this.initialize();
        }
        return this.userService;
    }

    static getUserRepository(): IUserRepository {
        if (!this.userRepository) {
            this.initialize();
        }
        return this.userRepository;
    }

    static getTopologyService(): ITopologyService {
        if (!this.topologyService) {
            this.initialize();
        }
        return this.topologyService;
    }

    static getTopologyRepository(): ITopologyRepository {
        if (!this.topologyRepository) {
            this.initialize();
        }
        return this.topologyRepository;
    }

    static getDeviceRepository(): IDeviceRepository {
        if (!this.deviceRepository) {
            this.initialize();
        }
        return this.deviceRepository;
    }

    static getDeviceService(): IDeviceService {
        if (!this.deviceService) {
            this.initialize();
        }
        return this.deviceService;
    }
}