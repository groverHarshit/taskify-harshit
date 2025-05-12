import { FilterQuery } from 'mongoose';
import { ITask, IUser } from '../interfaces';
import { BaseEntity } from './base.entity';
import { TASK_MODEL } from '../models';
import { LoggerUtil } from '../utils';
import { UserEntity } from './user.entity';
import mongoose from 'mongoose';

export class TaskEntity extends BaseEntity<ITask> {
    private logger: LoggerUtil;
    private userEntity: UserEntity;

    constructor(logger: LoggerUtil) {
        super(TASK_MODEL);
        this.logger = logger.setFileName('task.entity.ts');
        this.userEntity = new UserEntity(logger);
    }

    /**
     * Create a new task
     */
    async createTask(taskData: Partial<ITask>): Promise<ITask> {
        this.logger.setFunctionName('createTask').info(`Creating task: ${taskData.title}`);
        taskData.unassigned = !taskData.userId;
        const task = await this._create(taskData);
        this.logger.info(`Task created: ${JSON.stringify(task)}`);
        return task;
    }

    /**
     * Get a task by ID
     */
    async getTaskById(taskId: string): Promise<ITask | null> {
        this.logger.setFunctionName('getTaskById').info(`Getting task by ID: ${taskId}`);
        const task = await this._findById(taskId);
        if (task) {
            const taskCopy = JSON.parse(JSON.stringify(task));
            const userIds = [taskCopy.userId, taskCopy.createdBy].filter(id => id) as mongoose.Types.ObjectId[];
            const users = await this.userEntity.searchUsers(userIds.map(id => id.toString()));
            const userMap = new Map(users.map(user => [user._id!.toString(), user]));
            
            if (taskCopy.userId) {
                taskCopy.user = userMap.get(taskCopy.userId.toString());
            }
            taskCopy.createdUser = userMap.get(taskCopy.createdBy.toString());
            return taskCopy;
        }
        return null;
    }

    /**
     * Get tasks for a user with optional filters
     */
    async getTasksByUser(
        userId: string | undefined,
        page: number = 1,
        limit: number = 10,
        filters: Partial<Pick<ITask, 'status' | 'priority'>> = {},
        searchTerm?: string
    ): Promise<{ data: ITask[]; total: number }> {
        this.logger.setFunctionName('getTasksByUser').info(`Getting tasks for user: ${userId || 'all'}`);
        
        const query: FilterQuery<ITask> = { ...filters };
        if (userId) {
            query.userId = userId;
        }
        
        // Add search functionality if searchTerm is provided
        if (searchTerm) {
            query.$or = [
                { title: { $regex: searchTerm, $options: 'i' } },
                { description: { $regex: searchTerm, $options: 'i' } }
            ];
        }
        
        this.logger.info(`Query: ${JSON.stringify(query)}`);
        const { data, total } = await this._getAll(page, limit, query);
        this.logger.info(`Retrieved ${data.length} tasks`);

        // Extract unique userIds (including createdBy) from tasks and convert to string
        const userIds = [...new Set(data.flatMap(task => [task.userId?.toString(), task.createdBy.toString()]).filter(id => id))] as string[];
        this.logger.info(`User IDs to fetch: ${userIds.join(', ')}`);

        // Fetch user data for these userIds
        const users = await this.userEntity.searchUsers(userIds);
        this.logger.info(`Retrieved ${users.length} users`);

        // Create a map of userId to user object for quick lookup
        const userMap = new Map(users.map(user => [user._id!.toString(), user]));

        // Attach user data to tasks and handle unassigned tasks
        const tasksWithUserData = data.map((task: ITask) => {
            const tCopy = JSON.parse(JSON.stringify(task))
            this.logger.info(`Processing task: ${tCopy._id}, userId: ${tCopy.userId}, unassigned: ${tCopy.unassigned}`);
            if (tCopy.unassigned) {
                tCopy.userId = null;
            } else if (tCopy.userId) {
                (tCopy as any).user = userMap.get(tCopy.userId.toString());
                this.logger.info(`Attached user data: ${JSON.stringify((tCopy as any).user)}`);
            }
            (tCopy as any).createdUser = userMap.get(tCopy.createdBy.toString());
            return tCopy;
        });

        return {
            data: tasksWithUserData,
            total
        };
    }

    /**
     * Get tasks assigned by a user (the original task creator)
     * This allows a user to see tasks they've assigned to others
     */
    async getAssignedTasks(
        assignerUserId: string,
        page: number = 1,
        limit: number = 10,
        filters: Partial<Pick<ITask, 'status' | 'priority'>> = {},
        assignedToUserId?: string,
        searchTerm?: string
    ): Promise<{ data: ITask[]; total: number }> {
        this.logger.setFunctionName('getAssignedTasks').info(`Getting tasks assigned by user: ${assignerUserId}`);
        
        // Start with the filters provided
        const query: FilterQuery<ITask> = { ...filters, assignerUserId };
        
        // Add filter for assigned userId if provided
        if (assignedToUserId) {
            query.userId = assignedToUserId;
        }
        
        // Add search functionality if searchTerm is provided
        if (searchTerm) {
            query.$or = [
                { title: { $regex: searchTerm, $options: 'i' } },
                { description: { $regex: searchTerm, $options: 'i' } }
            ];
        }
        
        const { data, total } = await this._getAll(page, limit, query);

        // Get unique userIds (including createdBy) from tasks and convert to string
        const userIds = [...new Set(data.flatMap(task => [task.userId?.toString(), task.createdBy.toString()]).filter(id => id))] as string[];

        // Fetch user data
        const users = await this.userEntity.searchUsers(userIds);
        const userMap = new Map(users.map(user => [user._id!.toString(), user]));

        // Attach user data to tasks
        const tasksWithUserData = data.map((task: ITask) => {
            const taskCopy = JSON.parse(JSON.stringify(task));
            if (taskCopy.userId) {
                taskCopy.user = userMap.get(taskCopy.userId.toString());
            }
            taskCopy.createdUser = userMap.get(taskCopy.createdBy.toString());
            return taskCopy;
        });

        return {
            data: tasksWithUserData,
            total
        };
    }

    /**
     * Update a task
     */
    async updateTask(taskId: string, taskData: Partial<ITask>): Promise<ITask | null> {
        this.logger.setFunctionName('updateTask').info(`Updating task: ${taskId}`);
        return this._updateById(taskId, taskData);
    }

    /**
     * Delete a task
     */
    async deleteTask(taskId: string): Promise<ITask | null> {
        this.logger.setFunctionName('deleteTask').info(`Deleting task: ${taskId}`);
        return this._deleteById(taskId);
    }
}
