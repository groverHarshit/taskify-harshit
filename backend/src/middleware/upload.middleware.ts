import { Request, Response, NextFunction } from 'express';
import { upload, BadRequestError } from '../utils';

export const uploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
  upload.single('file')(req, res, (err: any) => {
    if (err) {
      return BadRequestError(res, err.message);
    }
    next();
  });
};