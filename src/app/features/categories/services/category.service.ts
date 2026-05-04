import { Injectable, signal } from '@angular/core';
import { Category } from '../../../core/models';
import { ICategoryRepository } from '../../../core/repositories';
import { StorageService } from '../../../core/services/storage.service';

const CATEGORIES_KEY = 'categories';

export const CATEGORY_COLORS = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E',
  '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899',
  '#14B8A6', '#F43F5E',
];

@Injectable({ providedIn: 'root' })
export class CategoryService implements ICategoryRepository {
  private readonly _categories = signal<Category[]>([]);

  readonly categories = this._categories.asReadonly();

  constructor(private storage: StorageService) {}

  async load(): Promise<void> {
    const stored = await this.storage.get<Category[]>(CATEGORIES_KEY);
    this._categories.set(stored ?? []);
  }

  async getAll(): Promise<Category[]> {
    return this._categories();
  }

  async create(data: Pick<Category, 'name' | 'color'>): Promise<Category> {
    const category: Category = {
      id: crypto.randomUUID(),
      name: data.name,
      color: data.color,
      createdAt: Date.now(),
    };
    const updated = [...this._categories(), category];
    this._categories.set(updated);
    await this.storage.set(CATEGORIES_KEY, updated);
    return category;
  }

  async update(id: string, changes: Partial<Category>): Promise<Category> {
    const categories = this._categories();
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) throw new Error(`Category ${id} not found`);

    const updated: Category = { ...categories[index], ...changes };
    const newCategories = categories.map(c => (c.id === id ? updated : c));
    this._categories.set(newCategories);
    await this.storage.set(CATEGORIES_KEY, newCategories);
    return updated;
  }

  async delete(id: string): Promise<void> {
    const newCategories = this._categories().filter(c => c.id !== id);
    this._categories.set(newCategories);
    await this.storage.set(CATEGORIES_KEY, newCategories);
  }

  getCategoryById(id: string | null): Category | undefined {
    if (!id) return undefined;
    return this._categories().find(c => c.id === id);
  }
}
