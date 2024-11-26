import { PrismaClient } from "@prisma/client";
import { PrismaUserRespository } from "../repositories/PrismaUserRepository";
import { UserService } from "../services/UserService";
import { IUserRepository, IUserService } from "../types/classInterfaces";

export class DIContainer {
    private static prismaClient: PrismaClient;
    private static userRepository: IUserRepository;
    private static userService: IUserService;

    static initialize() {
        this.prismaClient = this.prismaClient || new PrismaClient();
        this.userRepository = new PrismaUserRespository(this.prismaClient)
        this.userService = new UserService(this.userRepository);
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
}