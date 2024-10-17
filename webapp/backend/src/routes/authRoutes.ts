import { PrismaClient, user as UserModel } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { authenticateToken } from '../middleware/authTokenMiddleware';
import { AuthenticatedRequest } from '../types';
import { createJwtToken } from '../utils/jwt';


const prisma = new PrismaClient();
const router = Router();

router.post('/login', async (req, res) => {
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
});
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    const existingUser: UserModel | null = await prisma.user.findFirst({
        where: {
            OR: [
                { username },
                { email }
            ]
        }
    });

    if (existingUser) {
        res.status(400).json({ detail: 'User already exists' });
        return;
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    await prisma.user.create({
        data: {
            username,
            email,
            password: hashedPassword,
            account_type: 'user', // or 'admin'
            created_at: new Date(),
            updated_at: new Date(),
        },
    });

    res.json({ message: 'User created successfully' });
});
router.post('/refresh', authenticateToken, async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    // get information from user in request provided via authTokenMiddleware
    const { id, username, email } = req.user;
    // create a new token
    const token = createJwtToken(id, username, email);
    res.json({ access_token: token, token_type: 'bearer' });
});

export default router;
