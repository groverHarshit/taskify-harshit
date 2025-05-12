import { BaseEntity } from './base.entity';
import { USER_MODEL } from '../models';
import { IUser } from '../interfaces';
import { UserDTO } from '../dtos';
import { LoggerUtil } from '../utils/logger.util';
import mongoose from 'mongoose';

export class UserEntity extends BaseEntity<IUser> {
    private logger: LoggerUtil;

    constructor(logger: LoggerUtil) {
        super(USER_MODEL);
        this.logger = logger;
    }

    async findById(id: string): Promise<UserDTO | null> {
        this.logger.setFunctionName('findById').info(`Started finding user by ID: ${id}`);
        const user = await this._findById(id);
        this.logger.info(user ? `User found with ID: ${id}` : `No user found with ID: ${id}`);
        return user ? new UserDTO(user) : null;
    }

    async findOne(query: Partial<IUser>): Promise<UserDTO | null> {
        this.logger.setFunctionName('findOne').info('Started finding one user');
        const user = await this._findOne(query);
        this.logger.info(user ? 'User found' : 'No user found');
        return user ? new UserDTO(user) : null;
    }

    async updateById(id: string, data: Partial<IUser>): Promise<UserDTO | null> {
        this.logger.setFunctionName('updateById').info(`Started updating user by ID: ${id}`);
        const user = await this._updateById(id, data);
        this.logger.info(user ? `User updated with ID: ${id}` : `No user found to update with ID: ${id}`);
        return user ? new UserDTO(user) : null;
    }

    async deleteById(id: string): Promise<UserDTO | null> {
        this.logger.setFunctionName('deleteById').info(`Started deleting user by ID: ${id}`);
        const user = await this._deleteById(id);
        this.logger.info(user ? `User deleted with ID: ${id}` : `No user found to delete with ID: ${id}`);
        return user ? new UserDTO(user) : null;
    }

    async getAll(page: number = 1, limit: number = 10, filters: Partial<IUser> = {}, convertToDTO: boolean = false): Promise<{ data: UserDTO[] | IUser[]; total: number }> {
        this.logger.setFunctionName('getAll').info('Started fetching all users');
        const { data, total } = await this._getAll(page, limit, filters);
        this.logger.info(`Fetched ${data.length} users with total count: ${total}`);
        const resultData = convertToDTO ? data.map(user => new UserDTO(user)) : data;
        return { data: resultData, total };
    }

    async createUser(data: Pick<IUser, 'username' | 'password' | 'role'> & {_id: mongoose.Types.ObjectId}, neededDTO: boolean = false): Promise<UserDTO | IUser> {
        this.logger.setFunctionName('createUser').info('Started creating a new user');

        const user = await this._create({
            ...data
        });

        this.logger.info(`User created with ID: ${user._id}`);
        return neededDTO ? new UserDTO(user) : user;
    }

    async getUsersBasicInfo(page: number = 1, limit: number = 10, search: string = ''): Promise<{ data: { _id: string; username: string }[]; total: number }> {
        this.logger.setFunctionName('getUsersBasicInfo').info(`Getting users basic info with search: ${search}`);
        
        // Build filters
        const filters: any = { role: { $ne: 'admin' } };
        
        // Add search functionality if search term is provided
        if (search) {
            filters.username = { $regex: search, $options: 'i' };
        }
        
        // Use the enhanced _getAll method with filters and projection
        const { data, total } = await this._getAll(page, limit, filters, { _id: 1, username: 1 });
        
        this.logger.info(`Fetched ${data.length} users basic info with total count: ${total}`);
        
        // Transform _id to string format for API response
        const transformedData = data.map(user => ({
            _id: user._id.toString(),
            username: user.username
        }));
        
        return { data: transformedData, total };
    }

    async searchUsers(userIds: string[]): Promise<Partial<IUser>[]> {
        this.logger.setFunctionName('searchUsers').info(`Searching for users with IDs: ${userIds.join(', ')}`);
        
        const users = await USER_MODEL.find(
            { _id: { $in: userIds } },
            { password: 0 } // Exclude the password field
        ).exec();
        
        this.logger.info(`Found ${users.length} users`);
        
        return users;
    }
}
