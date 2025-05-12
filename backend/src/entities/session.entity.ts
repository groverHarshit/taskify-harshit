import { BaseEntity } from './base.entity';
import { SESSION_MODEL } from '../models';
import { ISession } from '../interfaces';
import mongoose from 'mongoose';
import { SessionDTO } from '../dtos';
import { LoggerUtil } from '../utils/logger.util';

export class SessionEntity extends BaseEntity<ISession> {
    private logger: LoggerUtil;

    constructor(logger: LoggerUtil) {
        super(SESSION_MODEL);
        this.logger = logger;
    }

    createSession(userId: mongoose.Types.ObjectId): mongoose.Types.ObjectId {
        this.logger.setFunctionName('createSession').info(`Started creating session for user ID: ${userId}`);
        const dto = new SessionDTO(userId);
        this._create(dto.toJSON());
        this.logger.info(`Session created for user ID: ${userId}`);
        return dto.getId();
    }

    async exists(userId: mongoose.Types.ObjectId): Promise<boolean> {
        this.logger.setFunctionName('exists').info(`Checking if session exists for user ID: ${userId}`);
        const sessionExists = await this._exists({ userId });
        this.logger.info(sessionExists ? `Session exists for user ID: ${userId}` : `No session exists for user ID: ${userId}`);
        return sessionExists;
    }

    async deleteSession(userId: mongoose.Types.ObjectId): Promise<void> {
        this.logger.setFunctionName('deleteSession').info(`Started deleting session for user ID: ${userId}`);
        await this._deleteByQuery({ userId });
        this.logger.info(`Session deleted for user ID: ${userId}`);
    }

    async findSessionById(sessionId: mongoose.Types.ObjectId): Promise<ISession | null> {
        this.logger.setFunctionName('findSessionById').info(`Finding session by ID: ${sessionId}`);
        const session = await this._findOne({ _id: sessionId });
        this.logger.info(session ? `Session found with ID: ${sessionId}` : `No session found with ID: ${sessionId}`);
        return session;
    }

    async deleteSessionByUserAndSessionId(userId: mongoose.Types.ObjectId, sessionId: mongoose.Types.ObjectId): Promise<void> {
        this.logger.setFunctionName('deleteSessionByUserAndSessionId').info(`Deleting session for user ID: ${userId} and session ID: ${sessionId}`);
        await this._deleteByQuery({ userId, _id: sessionId });
        this.logger.info(`Session deleted for user ID: ${userId} and session ID: ${sessionId}`);
    }

    async findSessionByUserIdAndSessionId(userId: mongoose.Types.ObjectId, sessionId: mongoose.Types.ObjectId): Promise<ISession | null> {
        this.logger.setFunctionName('findSessionByUserIdAndSessionId').info(`Finding session for user ID: ${userId} and session ID: ${sessionId}`);
        const session = await this._findOne({ userId, _id: sessionId });
        this.logger.info(session ? `Session found for user ID: ${userId} and session ID: ${sessionId}` : `No session found for user ID: ${userId} and session ID: ${sessionId}`);
        return session;
    }
}