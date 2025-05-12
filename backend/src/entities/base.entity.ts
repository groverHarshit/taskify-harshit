import { Model, FilterQuery, UpdateQuery } from 'mongoose';

export class BaseEntity<T> {
    private model: Model<T>;

    constructor(model: Model<T>) {
        this.model = model;
    }

    async _create(data: Partial<T>): Promise<T> {
        return this.model.create(data);
    }

    async _findById(id: string): Promise<T | null> {
        return this.model.findById(id).exec();
    }

    async _findOne(query: FilterQuery<T> = {}): Promise<T | null> {
        return this.model.findOne(query).exec();
    }

    async _updateById(id: string, data: Partial<T> | UpdateQuery<T>): Promise<T | null> {
        return this.model.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
    }

    async _updateByQuery(query: FilterQuery<T>, data: UpdateQuery<T>): Promise<T | null> {
        return this.model.findOneAndUpdate(query, data, { new: true }).exec();
    }

    async _deleteById(id: string): Promise<T | null> {
        return this.model.findByIdAndDelete(id).exec();
    }

    async _deleteByQuery(query: FilterQuery<T>): Promise<T | null> {
        return this.model.findOneAndDelete(query).exec();
    }

    async _deleteAllByQuery(query: FilterQuery<T> = {}): Promise<number> {
        const result = await this.model.deleteMany(query).exec();
        return result.deletedCount || 0;
    }

    async _getAll(page: number = 1, limit: number = 10, filters: FilterQuery<T> = {}, projection: Record<string, number> = {}): Promise<{ data: T[]; total: number }> {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.model.find(filters, projection).skip(skip).limit(limit).exec(),
            this.model.countDocuments(filters).exec(),
        ]);
        return { data, total };
    }

    async _exists(query: FilterQuery<T>): Promise<boolean> {
        return !!(await this.model.exists(query));
    }
}
