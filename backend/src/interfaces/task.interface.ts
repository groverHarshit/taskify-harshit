import mongoose from 'mongoose';
import { TASK_PRIORITY, TASK_STATUS } from '../constants';
import { IUser } from './user.interface';

export interface ITask {
    _id: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    dueDate?: Date;
    priority: typeof TASK_PRIORITY[keyof typeof TASK_PRIORITY];
    status: typeof TASK_STATUS[keyof typeof TASK_STATUS];
    userId: mongoose.Types.ObjectId | null;
    unassigned: boolean;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    user?: IUser;
    toJSON(): any;
    updateTask(data: Partial<ITask>): void;
    isValid(): boolean;
}
