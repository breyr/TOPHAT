import { Request } from "express";
import { AuthenticatedRequest } from "../types/types";

export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError'
    }
}

export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function checkForUserId(req: AuthenticatedRequest): number {
    const userId = req.user?.id;
    if (!userId) {
        throw new ValidationError("User ID is missing");
    }
    return userId
}

export function checkForTopologyId(req: Request): number {
    const { id } = req.params;
    if (isNaN(Number(id))) {
        throw new ValidationError('Invalid Topology ID')
    }
    return parseInt(id);
}