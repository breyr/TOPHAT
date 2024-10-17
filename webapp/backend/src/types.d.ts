import { user as UserModel } from '@prisma/client';
import { Request } from 'express';
import { JwtPayload } from "jsonwebtoken";


// interfaces when dealing with authenticated requests
export type UserJwtPayload = Pick<UserModel, 'id' | 'username' | 'email'>;
export interface CustomJwtPayload extends JwtPayload {
    user: UserJwtPayload
}
export interface AuthenticatedRequest extends Request {
    user?: CustomJwtPayload
}