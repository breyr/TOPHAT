import { user as UserModel } from '@prisma/client';
import { Request } from 'express';
import { JwtPayload } from "jsonwebtoken";

// type for api responses
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    payload?: T;
    error?: Error;
}
// interfaces when dealing with authenticated requests
export interface CustomJwtPayload extends JwtPayload {
    user: Pick<UserModel, 'id' | 'username' | 'email' | 'account_type'>;
}
export interface AuthenticatedRequest extends Request {
    user?: CustomJwtPayload
}