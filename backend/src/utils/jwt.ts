import * as dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY as string;
const EXPIRES_IN = '1h';
const REFRESH_EXPIRES_IN = '7d';

export const createJwtToken = (id: number, username: string, email: string, accountType: string, accountStatus: string) => {
    const payload = { id, username, email, accountType, accountStatus };
    return jwt.sign(payload, SECRET_KEY, { expiresIn: EXPIRES_IN });
};

export const createRefreshToken = (id: number, username: string, email: string, accountType: string, accountStatus: string) => {
    const payload = { id, username, email, accountType, accountStatus };
    return jwt.sign(payload, SECRET_KEY, { expiresIn: REFRESH_EXPIRES_IN });
};
