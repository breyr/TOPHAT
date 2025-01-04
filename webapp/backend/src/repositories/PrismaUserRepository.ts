import { PrismaClient, type User } from "@prisma/client";
import bcrypt from 'bcryptjs';
import type { RegisterUserRequestPayload } from "../../../common/shared-types";
import { IUserRepository } from "../types/classInterfaces";

export class PrismaUserRepository implements IUserRepository {
    private prisma: PrismaClient;

    constructor(prismaClient: PrismaClient) {
        this.prisma = prismaClient
    }

    create(formData: RegisterUserRequestPayload): Promise<User> {
        const hashedPassword = bcrypt.hashSync(formData.password, 10);
        return this.prisma.user.create({
            data: {
                username: formData.username,
                email: formData.email,
                password: hashedPassword,
                accountType: formData.accountType,
                createdAt: new Date(),
                updatedAt: new Date(),
            }
        })
    }

    findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findFirst({
            where: { email },
        })
    }

    findByUsername(username: string): Promise<User | null> {
        return this.prisma.user.findFirst({
            where: { username },
        })
    }

    delete(id: number): Promise<User | null> {
        return this.prisma.user.delete({
            where: { id },
        })
    }

}