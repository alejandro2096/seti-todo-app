import { Task } from '../models';

export interface ITaskRepository {
  getAll(): Promise<Task[]>;
  create(data: Pick<Task, 'title' | 'description' | 'categoryId'>): Promise<Task>;
  update(id: string, changes: Partial<Task>): Promise<Task>;
  delete(id: string): Promise<void>;
}

export const TASK_REPOSITORY = 'TASK_REPOSITORY';
