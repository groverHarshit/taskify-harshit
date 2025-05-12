import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils';
import { UserEntity, SessionEntity } from '../entities';
import { LoggerUtil, InvalidTokenError, EntityDoesNotExistError } from '../utils';
import mongoose from 'mongoose';
import '../interfaces'; // Import the extended Request interface

const logger = new LoggerUtil('auth.middleware.ts');
const userEntity = new UserEntity(logger);
const sessionEntity = new SessionEntity(logger);

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    logger.setFunctionName('authMiddleware').info('Authenticating request');
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return InvalidTokenError(res);
        }

        const token = authHeader.split(' ')[1];
        const decoded: any = verifyToken(token);

        const sessionId = new mongoose.Types.ObjectId(decoded.sessionId);

        const [user, session] = await Promise.all([
            userEntity.findById(decoded.userId), // Pass decoded.userId directly as a string
            sessionEntity.findSessionByUserIdAndSessionId(new mongoose.Types.ObjectId(decoded.userId), sessionId),
        ]);

        if (!user) {
            return EntityDoesNotExistError(res, 'User');
        }

        if (!session) {
            return EntityDoesNotExistError(res, 'Session');
        }

        req.userId = user._id; // Attach userId to the request
        req.sessionId = sessionId; // Attach sessionId to the request

        next();
    } catch (error: any) {
        logger.error(`Authentication error: ${error.message}`);
        return InvalidTokenError(res);
    }
};
