import { ObjectId } from 'mongoose';

export interface ISession {
    _id: ObjectId;
    userId: ObjectId;
    createdAt: Date;
    updatedAt: Date;
}