import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../types/types";

export const adminAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Ensure that the token was verified by the authToken middleware
  if (!req.jwt_payload) {
    res.status(403).json({ message: 'Forbidden: No token payload present' });
    return;
  }
  if (req.jwt_payload.accountType == 'USER') {
    res.status(403).json({ message: 'Forbidden: Admin privileges required' });
    return;
  }
  next();
}