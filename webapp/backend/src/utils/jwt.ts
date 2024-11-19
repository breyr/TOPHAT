import * as dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY as string;
const EXPIRES_IN = process.env.EXPIRES_IN || '1h';

export const createJwtToken = (userId: number, username: string, email: string, account_type: string) => {
    const payload = { userId, username, email, account_type };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: EXPIRES_IN });
    return token;
};