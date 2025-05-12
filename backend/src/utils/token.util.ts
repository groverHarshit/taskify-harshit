import jwt from 'jsonwebtoken';
import { ENV } from '../constants';

const SECRET_KEY = ENV.SECRET_KEY || 'default_secret';

export const generateToken = (payload: object) => {
    return jwt.sign(payload, SECRET_KEY, {expiresIn: '1h'})
};

export const verifyToken = (token: string) => {
    try {
        return jwt.verify(token, SECRET_KEY);
    } catch (error) {
        throw new Error('Invalid token');
    }
};