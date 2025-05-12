import mongoose from 'mongoose';

export class SessionDTO {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;

    constructor(userId: mongoose.Types.ObjectId, _id?: mongoose.Types.ObjectId) {
        this._id = _id || new mongoose.Types.ObjectId();
        this.userId = userId;
    }

    toJSON(): object {
        return {
            _id: this._id,
            userId: this.userId,
        };
    }

    getId(): mongoose.Types.ObjectId {
        return this._id;
    }
}