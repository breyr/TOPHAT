import { user as UserModel } from '@prisma/client';
import { Request } from 'express';
import { JwtPayload } from "jsonwebtoken";

// interfaces when dealing with authenticated requests
export interface CustomJwtPayload extends JwtPayload {
    user: Pick<UserModel, 'id' | 'username' | 'email' | 'account_type'>;
}
export interface AuthenticatedRequest extends Request {
    user?: CustomJwtPayload
}

export type AccountType = 'user' | 'admin'

export interface CreateUserDTO {
    username: string
    email: string
    password: string
    account_type: AccountType
}

export interface LoginRequestDTO {
    usernameOrEmail: string
    password: string
}

export interface UserResponse {
    id: number
    username: string
    email: string
    password: string
    account_type: string
}

export interface Topology {
    name?: string;
    thumbnail?: string;
    react_flow_state?: {
        nodes: Array<{
            id: string;
            type: string;
            position: { x: number; y: number };
            data: { label: string };
            measured?: { width: number; height: number };
            selected?: boolean;
            dragging?: boolean;
        }>;
        edges: Array<{
            source: string;
            target: string;
            id: string;
        }>;
        viewport: {
            x: number;
            y: number;
            zoom: number;
        };
    };
    expires_on?: string | Date;
    archived?: boolean;
}