import { Response } from 'express';

// Generic response function
export const GenericResponse = (res: Response, statusCode: number, message: string, payload: any = null): Response => {
    return res.status(statusCode).json({
        success: statusCode >= 200 && statusCode < 300,
        message,
        payload,
    });
};

// Predefined response functions
export const InvalidTokenError = (res: Response): Response => {
    return GenericResponse(res, 401, 'Invalid token');
};

export const InvalidCredentialsError = (res: Response): Response => {
    return GenericResponse(res, 401, 'Invalid credentials');
};

export const TokenExpiredError = (res: Response): Response => {
    return GenericResponse(res, 401, 'Token expired');
};

export const Success = (res: Response, message: string, payload: any = null): Response => {
    return GenericResponse(res, 200, message, payload);
};

export const CreateSuccess = (res: Response, message: string, payload: any = null): Response => {
    return GenericResponse(res, 201, message, payload);
};

export const BadRequestError = (res: Response, message: string): Response => {
    return GenericResponse(res, 400, message);
};

export const InternalServerError = (res: Response, error: any): Response => {
    return GenericResponse(res, 500, 'Internal server error', { error: error.message });
};

export const LoginSuccess = (res: Response, token: string): Response => {
    return Success(res, 'Login successful', { token });
};

export const LogoutSuccess = (res: Response): Response => {
    return Success(res, 'Logged out successfully');
};

export const EntityDoesNotExistError = (res: Response, entityName: string): Response => {
    return GenericResponse(res, 400, `${entityName} does not exist`);
};

export const EntityAlreadyExistsError = (res: Response, entityName: string): Response => {
    return GenericResponse(res, 409, `${entityName} already exists`);
};