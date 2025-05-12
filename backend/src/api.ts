import express from 'express';
import cors from 'cors';
import {ENV} from './constants';
import { connectToDatabase, runMigrations, LoggerUtil } from './utils';
import router from './routes';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';

const app = express();

const PORT = ENV.PORT;
const logger = new LoggerUtil('api.ts');

connectToDatabase();
runMigrations()

// Enable CORS for all routes
app.use(cors());
app.use(express.json());
app.use('/api', router);

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Task API',
            version: '1.0.0',
            description: 'API documentation for the Task application',
        },
        servers: [
            {
                url: `http://localhost:${PORT}/api`,
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./src/routes/*.ts'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.listen(PORT, () => {
    logger.setFunctionName('listen').info(`Server is running on port ${PORT}`);
});