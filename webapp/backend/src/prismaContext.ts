import { PrismaClient } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

export type DbContext = {
    prisma: PrismaClient
}

export type MockDbContext = {
    prisma: DeepMockProxy<PrismaClient>
}

export const createMockDbContext = (): MockDbContext => {
    return {
        prisma: mockDeep<PrismaClient>()
    }
}
