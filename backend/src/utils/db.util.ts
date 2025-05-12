import mongoose from 'mongoose';
import {ENV} from '../constants';
import { LoggerUtil } from './logger.util';

const logger = new LoggerUtil('db.util.ts')

export const connectToDatabase = async () => {
    logger.setFunctionName('connectToDatabase');
    try {
        await mongoose.connect(ENV.DB_URI);
        logger.info('Connected to MongoDB');
    } catch (error) {
        logger.error(`Error connecting to MongoDB: ${error}`);
        process.exit(1);
    }
};