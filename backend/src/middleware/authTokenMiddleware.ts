import { NextFunction, Response } from "express";
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, CustomJwtPayload } from "../types/types";

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'Unauthorized: No token provided' });
        return;
    }

    jwt.verify(token, process.env.SECRET_KEY!, (err, payload) => {
        if (err) {
            console.log('Token verification failed', err);
            res.status(403).json({ message: 'Forbidden: Invalid or expired token' });
            return;
        }
        req.jwt_payload = payload as CustomJwtPayload;
        next();
    })
}
