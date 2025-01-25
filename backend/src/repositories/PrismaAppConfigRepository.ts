import { AppConfig, PrismaClient } from '@prisma/client';
import { IAppConfigRepository } from '../types/classInterfaces';

export class AppConfigRepository implements IAppConfigRepository {
    private prisma: PrismaClient;

    constructor(prismaClient: PrismaClient) {
        this.prisma = prismaClient;
    }

    async findByKey(key: string): Promise<AppConfig | null> {
        return this.prisma.appConfig.findUnique({
            where: { key },
        });
    }

    async upsertConfig(key: string, value: string): Promise<AppConfig> {
        return this.prisma.appConfig.upsert({
            where: { key },
            update: { value },
            create: { key, value },
        });
    }
}