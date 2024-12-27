import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcryptjs';
import type { RegisterUserRequestPayload } from "../../../common/shared-types";
import { IUserRepository } from "../types/classInterfaces";
import { UserResponse } from "../types/types";

export class PrismaUserRepository implements IUserRepository {
    private prisma: PrismaClient;

    constructor(prismaClient: PrismaClient) {
        this.prisma = prismaClient
    }

    create(formData: RegisterUserRequestPayload): Promise<UserResponse> {
        const hashedPassword = bcrypt.hashSync(formData.password, 10);
        return this.prisma.user.create({
            data: {
                username: formData.username,
                email: formData.email,
                password: hashedPassword,
                account_type: formData.account_type,
                created_at: new Date(),
                updated_at: new Date(),
            },
            select: {
                id: true,
                email: true,
                username: true,
                password: true,
                account_type: true
            }
        })
    }

    findByEmail(email: string): Promise<UserResponse | null> {
        return this.prisma.user.findFirst({
            where: { email },
            select: {
                id: true,
                email: true,
                username: true,
                password: true,
                account_type: true
            }
        })
    }

    findByUsername(username: string): Promise<UserResponse | null> {
        return this.prisma.user.findFirst({
            where: { username },
            select: {
                id: true,
                email: true,
                username: true,
                password: true,
                account_type: true
            }
        })
    }

    delete(id: number): Promise<UserResponse | null> {
        return this.prisma.user.delete({
            where: { id },
            select: {
                id: true,
                email: true,
                username: true,
                password: true,
                account_type: true
            }
        })
    }

}