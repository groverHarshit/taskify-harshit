import dotenv from 'dotenv';
import { LOG_LEVELS } from './constants';

dotenv.config();

export const ENV = {
    DB_URI: process.env.DB_URI || 'mongodb://localhost:27017/task',
    PORT: process.env.PORT || 3000,
    SECRET_KEY: process.env.SECRET_KEY || 'default_secret',
    JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret',
    LOG_LEVELS: (process.env.LOG_LEVELS || `${Object.values(LOG_LEVELS).join(',')}`).split(','),
};