import { JsonValue } from '@prisma/client/runtime/library';
import { Request } from 'express';
import { JwtPayload } from "jsonwebtoken";

// interfaces for JwtPayloads and Authenticated Requests
export interface CustomJwtPayload extends JwtPayload {
    id: number;
    username: string;
    email: string;
    account_type: string;
}
export interface AuthenticatedRequest extends Request {
    jwt_payload?: CustomJwtPayload
}

// this interface is required still because although we have a Topology interface in the common project,
// it is less painful to just say that this DTO uses a JsonValue type instead of a ReactFlowState type
// this can be changed at some point, but for right now it's okay
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