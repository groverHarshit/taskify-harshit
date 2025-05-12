import { Schema, model } from 'mongoose';
import { USER_ROLES } from '../constants';
import { IUser } from '../interfaces';

const UserSchema = new Schema<IUser>({
    username: { type: String, required: true },
    password: { type: String, required: false },
    role: { type: String, enum: [USER_ROLES.ADMIN, USER_ROLES.USER], required: true },
}, { timestamps: true });

const User = model('User', UserSchema);

export const USER_MODEL = User;