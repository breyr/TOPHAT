import { user as UserModel } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Request, Response, Router } from 'express';
import { authenticateToken } from '../middleware/authTokenMiddleware';
import { DbContext } from '../prismaContext';
import { ApiResponse, AuthenticatedRequest } from '../types';
import { createJwtToken } from '../utils/jwt';

type LoginRequest = {
    usernameOrEmail: string,
    password: string
}

const createAuthRoutes = (ctx: DbContext): Router => {
    const router = Router();

    router.post('/login', async (req: Request, res: Response<ApiResponse<{ token: string }>>): Promise<void> => {
        const { usernameOrEmail, password } = req.body as LoginRequest;
        if (!usernameOrEmail) {
            res.status(400).json({ success: false, message: "Either username or email must be provided." });
            return;
        }
        // construct where conditions
        const whereCondition: { username?: string; email?: string } = {};
        if (!usernameOrEmail.includes('@')) whereCondition.username = usernameOrEmail;
        else whereCondition.email = usernameOrEmail;
        // find user
        const user: UserModel | null = await ctx.prisma.user.findFirst({
            where: whereCondition
        });
        // check if the user exists and the password matches
        if (!user || !bcrypt.compareSync(password, user.password)) {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
            return;
        }
        // create JWT token and send to client
        const token = createJwtToken(user.id, user.username, user.email, user.account_type);
        res.status(200).json({
            success: true,
            message: 'Login successful',
            payload: { token }
        });
    });

    router.post('/register', async (req: Request, res: Response<ApiResponse<null>>): Promise<void> => {
        const { username, email, password } = req.body;

        // check to see if a user exists with the provided username or email
        const existingUser: UserModel | null = await ctx.prisma.user.findFirst({
            where: {
                OR: [
                    { username },
                    { email }
                ]
            }
        });

        // if the user exists return 400
        if (existingUser) {
            res.json({ success: true, message: 'User already exists' });
            return;
        }

        // otherwise hash the password and add them to the table
        const hashedPassword = bcrypt.hashSync(password, 10);
        await ctx.prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                account_type: 'user', // or 'admin'
                created_at: new Date(),
                updated_at: new Date(),
            },
        });

        res.json({ success: true, message: 'User created successfully' });
    });

    router.post('/refresh', authenticateToken, async (req: AuthenticatedRequest, res: Response<ApiResponse<{ token: string }>>): Promise<void> => {
        // this endpoint is protected
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        // get information from user in request provided via authTokenMiddleware
        const { id, username, email, account_type } = req.user;
        // create a new token
        const token = createJwtToken(id, username, email, account_type);
        res.json({ success: true, message: 'Token refreshed successfully', payload: { token } });
    });


    return router;
}

export default createAuthRoutes;
