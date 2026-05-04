export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  categoryId: string | null;
  createdAt: number;
  updatedAt: number;
}
