import { UserEntity } from '../entities';
import { LoggerUtil } from './logger.util';
import { USER_ROLES } from '../constants';
import { UserDTO } from '../dtos';

const logger = new LoggerUtil('migration.util.ts');
const userEntity = new UserEntity(logger);

export const runMigrations = async (): Promise<void> => {
    logger.setFunctionName('runMigrations').info('Starting migrations');

    try {
        const adminUser = await userEntity._exists({ username: 'admin' });

        if (!adminUser) {
            logger.info('Admin user not found. Creating default admin user.');

            const dto = new UserDTO({
                username: 'admin',
                role: USER_ROLES.ADMIN
            });

            await dto.updatePassword('admin123');

            await userEntity.createUser(dto.toJSON(false, true) as any);

            logger.info('Default admin user created successfully');
        } else {
            logger.info('Admin user already exists. No action needed.');
        }
    } catch (error: any) {
        logger.error(`Error during migrations: ${error.message}`);
    }
};