import { NextFunction, Response } from "express";
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, CustomJwtPayload } from "../types/types";

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.sendStatus(401);
        return; // ensure the function exits after sending the response
    }

    jwt.verify(token, process.env.SECRET_KEY!, (err, user) => {
        if (err) {
            console.log('Token verification failed', err)
            res.sendStatus(403);
            return; // ensure the function exits after sending the response
        }
        req.user = user as CustomJwtPayload;
        next();
    })
}
