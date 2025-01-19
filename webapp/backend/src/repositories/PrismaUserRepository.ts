import { AccountStatus, PrismaClient, type AppUser } from "@prisma/client";
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
                accountStatus: AccountStatus.PENDING,
                createdAt: new Date(),
                updatedAt: new Date(),
            }
        })
    }

    getAll(): Promise<Partial<AppUser>[]> {
        return this.prisma.appUser.findMany({
            select: {
                id: true,
                username: true,
                email: true,
                accountType: true,
                accountStatus: true,
            },
        });
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

    findById(id: number): Promise<AppUser | null> {
        return this.prisma.appUser.findUnique({
            where: { id },
        })
    }

    delete(id: number): Promise<AppUser | null> {
        return this.prisma.appUser.delete({
            where: { id },
        })
    }

    async changePassword(userId: number, newPassword: string): Promise<AppUser | null> {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        return this.prisma.appUser.update({
            where: { id: userId },
            data: { 
                password: hashedPassword,
                updatedAt: new Date()
            }
        });
    }

}