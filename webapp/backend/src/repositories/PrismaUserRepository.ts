import { AccountStatus, PrismaClient, type AppUser } from "@prisma/client";
import bcrypt from 'bcryptjs';
import type { RegisterUserRequestPayload } from "../../../common/shared-types";
import { IUserRepository } from "../types/classInterfaces";

export class PrismaUserRepository implements IUserRepository {
    private prisma: PrismaClient;

    constructor(prismaClient: PrismaClient) {
        this.prisma = prismaClient
    }
    async update(id: number, data: Partial<AppUser>): Promise<Partial<AppUser>> {
        // this method does not update passwords
        return this.prisma.appUser.update({
            where: { id },
            data: {
                ...data,
                updatedAt: new Date(),
            },
            select: {
                id: true,
                username: true,
                email: true,
                tempPassword: true,
                accountType: true,
                accountStatus: true,
            }
        });
    }

    create(formData: RegisterUserRequestPayload): Promise<Partial<AppUser>> {
        const hashedPassword = bcrypt.hashSync(formData.password, 10);
        return this.prisma.appUser.create({
            data: {
                username: formData.username,
                email: formData.email,
                password: hashedPassword,
                tempPassword: formData.accountType !== 'OWNER' ? formData.password : '', // set tempPassword to be the users generated password or nothing if the user is an owner bc the owner account sets their own password at account creation
                accountType: formData.accountType,
                accountStatus: AccountStatus.PENDING,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            select: {
                id: true,
                username: true,
                email: true,
                tempPassword: true,
                accountType: true,
                accountStatus: true,
            }
        })
    }

    getAll(): Promise<Partial<AppUser>[]> {
        return this.prisma.appUser.findMany({
            select: {
                id: true,
                username: true,
                email: true,
                tempPassword: true,
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

    delete(id: number): Promise<Partial<AppUser> | null> {
        return this.prisma.appUser.delete({
            where: { id },
            select: {
                id: true,
            }
        })
    }

}