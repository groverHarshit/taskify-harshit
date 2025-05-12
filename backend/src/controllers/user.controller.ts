import { Request, Response } from 'express';
import { UserEntity, SessionEntity } from '../entities';
import { InvalidCredentialsError, LoginSuccess, LogoutSuccess, InternalServerError, LoggerUtil, BadRequestError, CreateSuccess, Success, EntityAlreadyExistsError } from '../utils';
import { UserDTO } from '../dtos';
import { USER_ROLES } from '../constants';

const logger = new LoggerUtil('user.controller.ts');
const userEntity = new UserEntity(logger);
const sessionEntity = new SessionEntity(logger);

export class UserController {
    static async login(req: Request, res: Response): Promise<Response> {
        logger.setFunctionName('login').info('Login attempt started');
        try {
            const { username, password } = req.body;

            const user = await userEntity.findOne({ username });
            if (!user) {
                logger.warn('User not found');
                return InvalidCredentialsError(res);
            }

            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                logger.warn('Invalid credentials');
                return InvalidCredentialsError(res);
            }

            const sessionId = sessionEntity.createSession(user._id);
            const token = user.getToken(sessionId);

            logger.info('Login successful');
            return LoginSuccess(res, token);
        } catch (error: any) {
            logger.error(`Error during login: ${error.message}`);
            return InternalServerError(res, error);
        }
    }

    static async logout(req: Request, res: Response): Promise<Response> {
        logger.setFunctionName('logout').info('Logout attempt started');
        try {
            const { userId, sessionId } = req;

            if (!userId || !sessionId) {
                logger.warn('User ID or Session ID missing');
                return BadRequestError(res, 'User ID and Session ID are required');
            }

            await sessionEntity.deleteSessionByUserAndSessionId(userId, sessionId);

            logger.info('Logout successful');
            return LogoutSuccess(res);
        } catch (error: any) {
            logger.error(`Error during logout: ${error.message}`);
            return InternalServerError(res, error);
        }
    }

    static async createUser(req: Request, res: Response): Promise<Response> {
        logger.setFunctionName('createUser').info('Create user attempt started');
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                logger.warn('Username or password missing');
                return BadRequestError(res, 'Username and password are required');
            }

            const dto = new UserDTO({
                username,
                role: USER_ROLES.ADMIN
            })

            dto.updatePassword(password)

            const newUser = await userEntity.createUser(dto.toJSON(false, true) as any);

            logger.info('User created successfully');
            return CreateSuccess(res, 'User created successfully', newUser);
        } catch (error: any) {
            logger.error(`Error during user creation: ${error.message}`);
            return InternalServerError(res, error);
        }
    }

    static async signup(req: Request, res: Response): Promise<Response> {
        logger.setFunctionName('signup').info('Signup attempt started');
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                logger.warn('Username or password missing');
                return BadRequestError(res, 'Username and password are required');
            }

            // Check if user already exists
            const existingUser = await userEntity.findOne({ username });
            if (existingUser) {
                logger.warn(`User with username ${username} already exists`);
                return EntityAlreadyExistsError(res, 'User');
            }

            const dto = new UserDTO({
                username,
                role: USER_ROLES.USER
            });

            await dto.updatePassword(password);

            const newUser = await userEntity.createUser(dto.toJSON(false, true) as any);

            logger.info('User created successfully');
            // Convert the returned user to a clean response object
            const userResponse = { 
                _id: (newUser as any)._id.toString(), 
                username: (newUser as any).username,
                role: (newUser as any).role
            };
                
            return CreateSuccess(res, 'User created successfully', userResponse);
        } catch (error: any) {
            logger.error(`Error during signup: ${error.message}`);
            return InternalServerError(res, error);
        }
    }

    static async listUsers(req: Request, res: Response): Promise<Response> {
        logger.setFunctionName('listUsers').info('List users attempt started');
        try {
            // Get page, limit, and search term from query parameters
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string || '';

            // Fetch users with pagination and search, but select only username and _id
            const { data, total } = await userEntity.getUsersBasicInfo(page, limit, search);

            logger.info(`Retrieved ${data.length} users`);
            return Success(res, 'Users retrieved successfully', {
                users: data,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            });
        } catch (error: any) {
            logger.error(`Error listing users: ${error.message}`);
            return InternalServerError(res, error);
        }
    }
}
