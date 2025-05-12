import { Schema, model } from 'mongoose';
import { ISession } from '../interfaces';

const SessionSchema = new Schema<ISession>({
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
}, { timestamps: true });

const Session = model<ISession>('Session', SessionSchema);

export const SESSION_MODEL = Session;