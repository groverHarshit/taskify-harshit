import { generateToken, hashPassword, comparePassword } from '../utils';
import { USER_ROLES } from '../constants';
import mongoose from 'mongoose';
import { IUser } from '../interfaces';

export class UserDTO {
    _id: mongoose.Types.ObjectId;
    username: string;
    role: typeof USER_ROLES[keyof typeof USER_ROLES];
    private password?: string;
    createdAt?: Date;
    updatedAt?: Date;

    constructor(user: Pick<IUser, 'username' | 'password'> & Partial<IUser>) {
        this._id = user._id || new mongoose.Types.ObjectId();
        this.username = user.username;
        this.role = user.role || USER_ROLES.USER;
        this.password = user.password || '';
        this.createdAt = user.createdAt;
        this.updatedAt = user.updatedAt;
    }

    private isRole(role: string): boolean {
        return this.role === role;
    }

    isAdmin(): boolean {
        return this.isRole(USER_ROLES.ADMIN);
    }

    isUser(): boolean {
        return this.isRole(USER_ROLES.USER);
    }

    async updatePassword(newPassword: string): Promise<void> {
        this.password = await hashPassword(newPassword);
    }

    updateData(username: string, role: typeof USER_ROLES[keyof typeof USER_ROLES]): void {
        this.username = username;
        this.role = role;
    }

    async comparePassword(password: string): Promise<boolean> {
        if(!this.password) return true;
        return comparePassword(password, this.password);
    }

    getToken(sessionId: mongoose.Types.ObjectId): string {
        return generateToken({ userId: this._id.toString(), sessionId: sessionId.toString() });
    }

    toJSON(needTimestamps: boolean = true, includePassword: boolean = false): Partial<IUser> {
        const json: Partial<IUser> = {
            _id: this._id,
            username: this.username,
            role: this.role,
        };

        if (needTimestamps) {
            json.createdAt = this.createdAt;
            json.updatedAt = this.updatedAt;
        }

        if (includePassword) {
            json.password = this.password;
        }

        return json;
    }
}