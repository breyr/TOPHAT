import { PrismaClient, user as UserModel } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { RequestHandler } from 'express';
import { AuthenticatedRequest } from '../types';
import { createJwtToken } from '../utils/jwt';

const prisma = new PrismaClient();

export const login: RequestHandler = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        const user: UserModel | null = await prisma.user.findFirst({
            where: { username }
        });

        if (!user || !bcrypt.compareSync(password, user.password)) {
            res.status(400).json({ detail: 'Invalid credentials' });
            return;
        }

        const token = createJwtToken(user.id, user.username, user.email);
        res.json({ access_token: token, token_type: 'bearer' });
    } catch (error) {
        next(error);
    }
};

export const register: RequestHandler = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        const existingUser: UserModel | null = await prisma.user.findFirst({
            where: { username }
        });

        if (existingUser) {
            res.status(400).json({ detail: 'User already exists' });
            return;
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        const newUser: UserModel = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                account_type: 'user', // or 'admin'
                created_at: new Date(),
                updated_at: new Date(),
            },
        });

        const token = createJwtToken(newUser.id, newUser.username, newUser.email);
        res.json({ access_token: token, token_type: 'bearer' });
    } catch (error) {
        next(error);
    }
};

export const refresh: RequestHandler = async (req: AuthenticatedRequest, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        // get information from user in request provided via authTokenMiddleware
        const { id, username, email } = req.user;
        // create a new token
        const token = createJwtToken(id, username, email);
        res.json({ access_token: token, token_type: 'bearer' });
    } catch (error) {
        next(error);
    }
};