import { user as UserModel } from '@prisma/client';
import { JsonValue } from '@prisma/client/runtime/library';
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

export interface CreateTopologyDTO {
    name: string
}

export interface CreatedTopologyResponse {
    id: number
    name: string
    expires_on: Date
}

export interface UpdateTopologyDTO {
    name: string;
    id: number;
    created_at: Date;
    updated_at: Date;
    user_id: number;
    thumbnail: string;
    react_flow_state: JsonValue;
    expires_on: Date;
    archived: boolean;
}

export interface Topology {
    name: string;
    id: number;
    created_at: Date;
    updated_at: Date;
    user_id: number;
    thumbnail: Buffer;
    react_flow_state: JsonValue;
    expires_on: Date;
    archived: boolean;
}