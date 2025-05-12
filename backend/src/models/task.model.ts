import { Schema, model } from 'mongoose';
import { TASK_PRIORITY, TASK_STATUS } from '../constants';
import { ITask } from '../interfaces';

const TaskSchema = new Schema<ITask>(
    {
        title: { type: String, required: true },
        description: { type: String, required: false },
        dueDate: { type: Date, required: false },
        priority: {
            type: String,
            enum: Object.values(TASK_PRIORITY),
            default: TASK_PRIORITY.MEDIUM,
            required: true,
        },
        status: {
            type: String,
            enum: Object.values(TASK_STATUS),
            default: TASK_STATUS.PENDING,
            required: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: false,
            default: null
        },
        unassigned: {
            type: Boolean,
            default: true
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
    },
    { timestamps: true }
);

// Add indexes for better query performance
TaskSchema.index({ userId: 1 });
TaskSchema.index({ status: 1 });
TaskSchema.index({ priority: 1 });
TaskSchema.index({ dueDate: 1 });
TaskSchema.index({ createdBy: 1 });

TaskSchema.methods.toJSON = function() {
    const task = this.toObject();
    delete task.__v;
    return task;
};

TaskSchema.methods.updateTask = function(data: Partial<ITask>) {
    Object.assign(this, data);
};

TaskSchema.methods.isValid = function() {
    return !this.validateSync();
};

const Task = model<ITask>('Task', TaskSchema);

export const TASK_MODEL = Task;
