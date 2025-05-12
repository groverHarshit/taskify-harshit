import { USER_ROLES } from '../constants';
import { Types } from 'mongoose';

export interface IUser {
    _id: Types.ObjectId;
    username: string;
    password?: string;
    role: typeof USER_ROLES[keyof typeof USER_ROLES];
    createdAt: Date;
    updatedAt: Date;
}