import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    logger.error('Unhandled error', {
        error: err.message,
        stack: err.stack
    })

    const statusCode = err.name === 'ValidationError' ? 400 : 500

    res.status(statusCode).json({
        status: 'error',
        message: err.message || 'Internal Server Error'
    })
}