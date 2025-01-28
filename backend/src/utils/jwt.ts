import * as dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY as string;
const EXPIRES_IN = '1h';

export const createJwtToken = (id: number, username: string, email: string, accountType: string, accountStatus: string) => {
    const payload = { id, username, email, accountType, accountStatus };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: EXPIRES_IN });
    return token;
};