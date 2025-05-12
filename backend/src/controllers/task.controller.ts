import { Request, Response } from 'express';
import { TaskEntity } from '../entities';
import { 
    LoggerUtil, 
    BadRequestError, 
    Success,
    CreateSuccess,
    InternalServerError,
    EntityDoesNotExistError
} from '../utils';
import { TaskDTO } from '../dtos';
import { TASK_STATUS, TASK_PRIORITY } from '../constants';
import mongoose from 'mongoose';
import { ITask } from '../interfaces';

const logger = new LoggerUtil('task.controller.ts');
const taskEntity = new TaskEntity(logger);

export class TaskController {
    /**
     * Create a new task
     */
    static async createTask(req: Request, res: Response): Promise<Response> {
        logger.setFunctionName('createTask').info('Creating new task');
        try {
            const { title, description, dueDate, priority, status, userId: assignedUserId } = req.body;
            const creatorUserId = req.userId;

            if (!title) {
                return BadRequestError(res, 'Title is required');
            }

            if (!creatorUserId) {
                return EntityDoesNotExistError(res, 'User');
            }

            const taskDTO = new TaskDTO({
                title,
                description,
                dueDate: dueDate ? new Date(dueDate) : undefined,
                priority: priority || TASK_PRIORITY.MEDIUM,
                status: status || TASK_STATUS.PENDING,
                userId: assignedUserId ? new mongoose.Types.ObjectId(assignedUserId) : new mongoose.Types.ObjectId(creatorUserId),
                createdBy: new mongoose.Types.ObjectId(creatorUserId),
                unassigned: !assignedUserId
            });

            if (!taskDTO.isValid()) {
                return BadRequestError(res, 'Invalid task data');
            }

            const newTask = await taskEntity.createTask(taskDTO);
            logger.info(`New task created: ${JSON.stringify(newTask)}`);
            return CreateSuccess(res, 'Task created successfully', new TaskDTO(newTask).toJSON());
        } catch (error: any) {
            logger.error(`Error creating task: ${error.message}`);
            return InternalServerError(res, error);
        }
    }

    /**
     * Get all tasks for a user with filtering and pagination
     */
    static async getTasks(req: Request, res: Response): Promise<Response> {
        logger.setFunctionName('getTasks').info('Getting tasks');
        try {
            const userId = req.userId;
            if (!userId) {
                return EntityDoesNotExistError(res, 'User');
            }

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const status = req.query.status as string;
            const priority = req.query.priority as string;
            const searchTerm = req.query.search as string;
            const all = req.query.all === 'true';

            // Validate filters
            const filters: any = {};
            if (!all) {
                filters.userId = userId;
            }
            
            if (status && Object.values(TASK_STATUS).includes(status as any)) {
                filters.status = status;
            }
            
            if (priority && Object.values(TASK_PRIORITY).includes(priority as any)) {
                filters.priority = priority;
            }

            const { data, total } = await taskEntity.getTasksByUser(
                all ? undefined : userId.toString(),
                page,
                limit,
                filters,
                searchTerm
            );

            const transformedTasks = data.map((task: ITask) => {
                // console.log('Processing task:', {
                //     id: task._id,
                //     userId: task.userId,
                //     createdBy: task.createdBy,
                //     hasToJSON: typeof task.toJSON === 'function'
                // });
                return task;
            });

            return Success(res, 'Tasks retrieved successfully', {
                tasks: transformedTasks,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            });
        } catch (error: any) {
            logger.error(`Error getting tasks: ${error.message}`);
            return InternalServerError(res, error);
        }
    }

    /**
     * Get a single task by ID
     */
    static async getTaskById(req: Request, res: Response): Promise<Response> {
        logger.setFunctionName('getTaskById').info(`Getting task by ID: ${req.params.id}`);
        try {
            const userId = req.userId;
            if (!userId) {
                return EntityDoesNotExistError(res, 'User');
            }

            const taskId = req.params.id;
            const task = await taskEntity.getTaskById(taskId);

            if (!task) {
                return EntityDoesNotExistError(res, 'Task');
            }

            return Success(res, 'Task retrieved successfully', task);
        } catch (error: any) {
            logger.error(`Error getting task: ${error.message}`);
            return InternalServerError(res, error);
        }
    }

    /**
     * Update a task
     */
    static async updateTask(req: Request, res: Response): Promise<Response> {
        logger.setFunctionName('updateTask').info(`Updating task: ${req.params.id}`);
        try {
            const userId = req.userId;
            if (!userId) {
                return EntityDoesNotExistError(res, 'User');
            }

            const taskId = req.params.id;
            const existingTask = await taskEntity.getTaskById(taskId);

            if (!existingTask) {
                return EntityDoesNotExistError(res, 'Task');
            }

            const taskDTO = new TaskDTO(existingTask);
            taskDTO.updateTask(req.body);

            if (!taskDTO.isValid()) {
                return BadRequestError(res, 'Invalid task data');
            }

            const updatedTask = await taskEntity.updateTask(taskId, taskDTO.toJSON(true, false));
            if (!updatedTask) {
                return BadRequestError(res, 'Failed to update task');
            }

            return Success(res, 'Task updated successfully', updatedTask);
        } catch (error: any) {
            logger.error(`Error updating task: ${error.message}`);
            return InternalServerError(res, error);
        }
    }

    /**
     * Delete a task
     */
    static async deleteTask(req: Request, res: Response): Promise<Response> {
        logger.setFunctionName('deleteTask').info(`Deleting task: ${req.params.id}`);
        try {
            const userId = req.userId;
            if (!userId) {
                return EntityDoesNotExistError(res, 'User');
            }

            const taskId = req.params.id;
            const task = await taskEntity.getTaskById(taskId);

            if (!task) {
                return EntityDoesNotExistError(res, 'Task');
            }

            await taskEntity.deleteTask(taskId);
            return Success(res, 'Task deleted successfully');
        } catch (error: any) {
            logger.error(`Error deleting task: ${error.message}`);
            return InternalServerError(res, error);
        }
    }

    /**
     * Assign a task to a user
     */
    static async assignTask(req: Request, res: Response): Promise<Response> {
        logger.setFunctionName('assignTask').info('Assigning task to user');
        try {
            const { id: taskId } = req.params;
            const { userId } = req.body;
            
            // Get the task
            const task = await taskEntity.getTaskById(taskId);
            if (!task) {
                return EntityDoesNotExistError(res, 'Task');
            }
            
            // Create a new TaskDTO with the updated data
            const taskDTO = new TaskDTO(task);
            taskDTO.updateTask({
                userId: userId || undefined,
                unassigned: !userId
            });

            if (!taskDTO.isValid()) {
                return BadRequestError(res, 'Invalid task data');
            }
            
            const updatedTask = await taskEntity.updateTask(taskId, taskDTO.toJSON(true, false));
            
            if (!updatedTask) {
                return BadRequestError(res, 'Failed to assign task');
            }
            
            logger.info(`Task ${taskId} ${userId ? 'assigned to user ' + userId : 'unassigned'}`);
            return Success(res, 'Task assigned successfully', updatedTask);
        } catch (error: any) {
            logger.error(`Error assigning task: ${error.message}`);
            return InternalServerError(res, error);
        }
    }
}
