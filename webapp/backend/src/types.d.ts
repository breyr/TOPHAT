import { user as UserModel } from '@prisma/client';
import { Request } from 'express';
import { JwtPayload } from "jsonwebtoken";


// interfaces when dealing with authenticated requests
export type UserJwtPayload = Pick<UserModel, 'id' | 'username' | 'email' | 'account_type'>;
export interface CustomJwtPayload extends JwtPayload {
    user: UserJwtPayload
    exp: number
}
export interface AuthenticatedRequest extends Request {
    user?: CustomJwtPayload
}