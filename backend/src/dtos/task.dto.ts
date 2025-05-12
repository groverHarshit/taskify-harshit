import mongoose from 'mongoose';
import { TASK_PRIORITY, TASK_STATUS } from '../constants';
import { ITask } from '../interfaces';

export class TaskDTO {
    _id: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    dueDate?: Date;
    priority: typeof TASK_PRIORITY[keyof typeof TASK_PRIORITY];
    status: typeof TASK_STATUS[keyof typeof TASK_STATUS];
    userId: mongoose.Types.ObjectId;
    unassigned: boolean;
    createdBy: mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;

    constructor(task: Partial<ITask>) {
        this._id = task._id || new mongoose.Types.ObjectId();
        this.title = task.title || '';
        this.description = task.description;
        this.dueDate = task.dueDate;
        this.priority = task.priority || TASK_PRIORITY.MEDIUM;
        this.status = task.status || TASK_STATUS.PENDING;
        this.userId = new mongoose.Types.ObjectId(task.userId || task.createdBy || new mongoose.Types.ObjectId());
        this.unassigned = task.unassigned ?? false;
        this.createdBy = new mongoose.Types.ObjectId(task.createdBy || task.userId || new mongoose.Types.ObjectId());
        this.createdAt = task.createdAt;
        this.updatedAt = task.updatedAt;
    }

    /**
     * Validates if all required fields are present and valid
     */
    isValid(): boolean {
        return (
            !!this.title &&
            Object.values(TASK_PRIORITY).includes(this.priority as any) &&
            Object.values(TASK_STATUS).includes(this.status as any)
        );
    }

    /**
     * Updates the task with new values
     */
    updateTask(updates: Partial<ITask>): void {
        if (updates.title) this.title = updates.title;
        if (updates.description !== undefined) this.description = updates.description;
        if (updates.dueDate !== undefined) this.dueDate = updates.dueDate;
        if (updates.priority) this.priority = updates.priority;
        if (updates.status) this.status = updates.status;
        if (updates.userId) {
            this.userId = new mongoose.Types.ObjectId(updates.userId);
            this.unassigned = false;
        }
        if (updates.unassigned !== undefined) {
            this.unassigned = updates.unassigned;
            if (this.unassigned) {
                this.userId = new mongoose.Types.ObjectId();
            }
        }
    }

    /**
     * Formats the task for API responses
     * @param includeUserId Whether to include the user ID in the response
     * @param includeId Whether to include the _id field in the response
     */
    toJSON(includeUserId = true, includeId = true): Partial<ITask> {
        const task: Partial<ITask> = {
            title: this.title,
            description: this.description,
            priority: this.priority,
            status: this.status,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            unassigned: this.unassigned,
            createdBy: this.createdBy
        };

        if (includeId) {
            task._id = this._id;
        }

        if (this.dueDate) {
            task.dueDate = this.dueDate;
        }

        if (includeUserId && !this.unassigned) {
            task.userId = this.userId;
        }

        return task;
    }
}
