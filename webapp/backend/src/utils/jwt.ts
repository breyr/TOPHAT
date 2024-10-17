import * as dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY as string;

export const createJwtToken = (userId: number, username: string, email: string) => {
    const payload = { userId, username, email };
    return jwt.sign(payload, SECRET_KEY, { expiresIn: process.env.EXPIRES_IN });
};