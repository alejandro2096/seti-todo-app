import { Category } from '../models';

export interface ICategoryRepository {
  getAll(): Promise<Category[]>;
  create(data: Pick<Category, 'name' | 'color'>): Promise<Category>;
  update(id: string, changes: Partial<Category>): Promise<Category>;
  delete(id: string): Promise<void>;
}

export const CATEGORY_REPOSITORY = 'CATEGORY_REPOSITORY';
