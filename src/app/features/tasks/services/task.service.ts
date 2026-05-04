import { Injectable, signal, computed } from '@angular/core';
import { Task } from '../../../core/models';
import { ITaskRepository } from '../../../core/repositories';
import { StorageService } from '../../../core/services/storage.service';

const TASKS_KEY = 'tasks';

@Injectable({ providedIn: 'root' })
export class TaskService implements ITaskRepository {
  private readonly _tasks = signal<Task[]>([]);

  readonly tasks = this._tasks.asReadonly();

  readonly completedCount = computed(() =>
    this._tasks().filter(t => t.completed).length
  );

  readonly pendingCount = computed(() =>
    this._tasks().filter(t => !t.completed).length
  );

  constructor(private storage: StorageService) {}

  async load(): Promise<void> {
    const stored = await this.storage.get<Task[]>(TASKS_KEY);
    this._tasks.set(stored ?? []);
  }

  async getAll(): Promise<Task[]> {
    return this._tasks();
  }

  async create(data: Pick<Task, 'title' | 'description' | 'categoryId'>): Promise<Task> {
    const task: Task = {
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description,
      categoryId: data.categoryId,
      completed: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = [...this._tasks(), task];
    this._tasks.set(updated);
    await this.storage.set(TASKS_KEY, updated);
    return task;
  }

  async update(id: string, changes: Partial<Task>): Promise<Task> {
    const tasks = this._tasks();
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) throw new Error(`Task ${id} not found`);

    const updated: Task = { ...tasks[index], ...changes, updatedAt: Date.now() };
    const newTasks = tasks.map(t => (t.id === id ? updated : t));
    this._tasks.set(newTasks);
    await this.storage.set(TASKS_KEY, newTasks);
    return updated;
  }

  async delete(id: string): Promise<void> {
    const newTasks = this._tasks().filter(t => t.id !== id);
    this._tasks.set(newTasks);
    await this.storage.set(TASKS_KEY, newTasks);
  }

  async toggleComplete(id: string): Promise<void> {
    const task = this._tasks().find(t => t.id === id);
    if (task) await this.update(id, { completed: !task.completed });
  }
}
