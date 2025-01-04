import { PrismaClient, type AppUser } from "@prisma/client";
import bcrypt from 'bcryptjs';
import type { RegisterUserRequestPayload } from "../../../common/shared-types";
import { IUserRepository } from "../types/classInterfaces";

export class PrismaUserRepository implements IUserRepository {
    private prisma: PrismaClient;

    constructor(prismaClient: PrismaClient) {
        this.prisma = prismaClient
    }

    create(formData: RegisterUserRequestPayload): Promise<AppUser> {
        const hashedPassword = bcrypt.hashSync(formData.password, 10);
        return this.prisma.appUser.create({
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

    findByEmail(email: string): Promise<AppUser | null> {
        return this.prisma.appUser.findFirst({
            where: { email },
        })
    }

    findByUsername(username: string): Promise<AppUser | null> {
        return this.prisma.appUser.findFirst({
            where: { username },
        })
    }

    delete(id: number): Promise<AppUser | null> {
        return this.prisma.appUser.delete({
            where: { id },
        })
    }

}