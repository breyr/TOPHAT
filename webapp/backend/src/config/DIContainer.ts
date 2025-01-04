import { PrismaClient } from "@prisma/client";
import { PrismaConnectionRepository } from "../repositories/PrismaConnectionRepository";
import { PrismaDeviceRepository } from "../repositories/PrismaDeviceRepository";
import { PrismaTopologyRepository } from "../repositories/PrismaTopologyRepository";
import { PrismaUserRepository } from "../repositories/PrismaUserRepository";
import { ConnectionService } from "../services/ConnectionService";
import { DeviceService } from "../services/DeviceService";
import { TopologyService } from "../services/TopologyService";
import { UserService } from "../services/UserService";
import {
    IConnectionRepository,
    IConnectionService,
    IDeviceRepository,
    IDeviceService,
    ITopologyRepository,
    ITopologyService,
    IUserRepository,
    IUserService
} from "../types/classInterfaces";

export class DIContainer {
    private static prismaClient: PrismaClient;
    private static userRepository: IUserRepository;
    private static userService: IUserService;
    private static topologyRepository: ITopologyRepository;
    private static topologyService: ITopologyService;
    private static deviceRepository: IDeviceRepository;
    private static deviceService: IDeviceService;
    private static connectionRepository: IConnectionRepository;
    private static connectionService: IConnectionService;

    static initialize() {
        this.prismaClient = this.prismaClient || new PrismaClient();
        this.userRepository = new PrismaUserRepository(this.prismaClient);
        this.userService = new UserService(this.userRepository);
        this.topologyRepository = new PrismaTopologyRepository(this.prismaClient);
        this.topologyService = new TopologyService(this.topologyRepository);
        this.deviceRepository = new PrismaDeviceRepository(this.prismaClient);
        this.deviceService = new DeviceService(this.deviceRepository);
        this.connectionRepository = new PrismaConnectionRepository(this.prismaClient);
        this.connectionService = new ConnectionService(this.connectionRepository);
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

    static getConnectionRepository(): IConnectionRepository {
        if (!this.connectionRepository) {
            this.initialize();
        }
        return this.connectionRepository;
    }

    static getConnectionService(): IConnectionService {
        if (!this.connectionService) {
            this.initialize();
        }
        return this.connectionService;
    }
}