import { PrismaClient } from "@prisma/client";
import { PrismaTopologyRepository } from "../repositories/PrismaTopologyRepository";
import { PrismaUserRespository } from "../repositories/PrismaUserRepository";
import { TopologyService } from "../services/TopologyService";
import { UserService } from "../services/UserService";
import { ITopologyRepository, ITopologyService, IUserRepository, IUserService } from "../types/classInterfaces";

export class DIContainer {
    private static prismaClient: PrismaClient;
    private static userRepository: IUserRepository;
    private static userService: IUserService;
    private static topologyRepository: ITopologyRepository;
    private static topologyService: ITopologyService;

    static initialize() {
        this.prismaClient = this.prismaClient || new PrismaClient();
        this.userRepository = new PrismaUserRespository(this.prismaClient)
        this.userService = new UserService(this.userRepository);
        this.topologyRepository = new PrismaTopologyRepository(this.prismaClient);
        this.topologyService = new TopologyService(this.topologyRepository);
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
}