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

    // find user
    const user: UserModel | null = await prisma.user.findFirst({
        where: { username }
    });

    // check if the user exists and the password matches
    if (!user || !bcrypt.compareSync(password, user.password)) {
        res.status(400).json({ message: 'Invalid credentials' });
        return;
    }

    // create JWT token and send to client
    const token = createJwtToken(user.id, user.username, user.email, user.account_type);
    res.json({ access_token: token, token_type: 'bearer' });
});
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    // check to see if a user exists with the provided username or email
    const existingUser: UserModel | null = await prisma.user.findFirst({
        where: {
            OR: [
                { username },
                { email }
            ]
        }
    });

    // if the user exists return 400
    if (existingUser) {
        res.status(400).json({ message: 'User already exists' });
        return;
    }

    // otherwise hash the password and add them to the table
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
    // this endpoint is protected
    if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    // get information from user in request provided via authTokenMiddleware
    const { id, username, email, account_type } = req.user;
    // create a new token
    const token = createJwtToken(id, username, email, account_type);
    res.json({ access_token: token, token_type: 'bearer' });
});

export default router;
