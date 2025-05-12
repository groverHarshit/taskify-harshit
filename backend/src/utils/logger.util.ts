import { LOG_LEVELS, ENV } from '../constants';
import chalk from 'chalk';

const DEFAULT_FILENAME = 'root';

const isLogLevelEnabled = (level: string) => ENV.LOG_LEVELS.includes(level);

const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
};

export class LoggerUtil {
    fileName: string = DEFAULT_FILENAME;
    functionName: string = '';

    constructor(fileName: string) {
        this.setFileName(fileName);
    }

    setFileName(fileName: string) {
        this.fileName = fileName || DEFAULT_FILENAME;
        return this;
    }

    setFunctionName(functionName: string) {
        this.functionName = functionName;
        return this;
    }

    log(message: string) {
        if (isLogLevelEnabled(LOG_LEVELS.LOG)) {
            const logMessage = `${formatDate(new Date())}:::${this.fileName}:::${this.functionName}:::${message}`;
            console.log(chalk.green(logMessage));
        }
    }

    info(message: string) {
        if (isLogLevelEnabled(LOG_LEVELS.INFO)) {
            const logMessage = `${formatDate(new Date())}:::${this.fileName}:::${this.functionName}:::${message}`;
            console.info(chalk.green(logMessage));
        }
    }
    
    warn(message: string) {
        if (isLogLevelEnabled(LOG_LEVELS.WARN)) {
            const logMessage = `${formatDate(new Date())}:::${this.fileName}:::${this.functionName}:::${message}`;
            console.warn(chalk.yellow(logMessage));
        }
    }
    
    error(message: string) {
        if (isLogLevelEnabled(LOG_LEVELS.ERROR)) {
            const logMessage = `${formatDate(new Date())}:::${this.fileName}:::${this.functionName}:::${message}`;
            console.error(chalk.red(logMessage));
        }
    }
}